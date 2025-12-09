// src/components/ReservationTable.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Car, ChartNoAxesCombined, CircleDotIcon, CalendarDays } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* =============== inline assets + helpers =============== */
const BUSINESS_INFO = {
  name: "CrowdFlow",
  tagline: "Smart Event & Crowd Management",
  address: "Sri Lanka Institute of Information Technology",
  phone: "+94 778985469",
  email: "info@crowdflow.lk",
  website: "www.crowdflow.lk",
};

// paste your base64 logo here if you want *everything* truly inline.
// keep it small (<200KB). Example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA..."
// leave as null to load /branding/logo.png from public, or render text-only header.
const LOGO_BASE64 = null;

async function toDataURL(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("image not found");
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** draw business header; return next Y for body */
function addBusinessHeader(doc, info = BUSINESS_INFO) {
  const i = { ...BUSINESS_INFO, ...info };
  const marginX = 14;
  const topY = 12;

  if (i.logo) {
    try {
      doc.addImage(i.logo, "PNG", marginX, topY - 2, 18, 18);
    } catch { /* ignore */ }
  }

  const leftX = i.logo ? marginX + 22 : marginX;
  doc.setFont("helvetica", "bold").setFontSize(13);
  doc.text(i.name, leftX, topY + 2);

  doc.setFont("helvetica", "normal").setFontSize(10);
  if (i.tagline) doc.text(i.tagline, leftX, topY + 7);
  const line2 = [i.address, i.phone].filter(Boolean).join("  •  ");
  if (line2) doc.text(line2, leftX, topY + 12);
  const line3 = [i.email, i.website].filter(Boolean).join("  •  ");
  if (line3) doc.text(line3, leftX, topY + 17);

  doc.setDrawColor(200).setLineWidth(0.2);
  doc.line(marginX, topY + 21, 200, topY + 21);

  return topY + 27;
}

/* ========================= component ========================= */
const API = "http://${API_BASE_URL}/api";
const RES_API = `${API}/reservations`;

const fmtLKR = (n) =>
  Number.isFinite(Number(n))
    ? new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "LKR",
        maximumFractionDigits: 0,
      }).format(Number(n))
    : "—";

const humanDuration = (start, end) => {
  const s = start ? new Date(start).getTime() : NaN;
  const e = end ? new Date(end).getTime() : NaN;
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return "—";
  const mins = Math.round((e - s) / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

const statusKey = (s) => String(s || "").trim().toLowerCase();

const displayOwner = (r) => {
  if (r?.driverName) return r.driverName;
  const user = r?.user || {};
  const full =
    user.fullName ||
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    r?.ownerName ||
    r?.owner ||
    r?.customerName ||
    r?.customer ||
    "";
  if (full) return full;
  return r?.plate || user.email || user.phone || "—";
};

const readSpotId = (r) =>
  r?.spotId ||
  r?.spot_id ||
  r?.spot?._id ||
  (typeof r?.spot === "string" ? r.spot : null) ||
  null;

export default function ReservationTable() {
  const [reservations, setReservations] = useState([]);
  const [cards, setCards] = useState([
    { title: "Total Reservations", icon: <Car color="#2f80ed" size={30} />, count: "0" },
    { title: "Total Occupied", icon: <CircleDotIcon color="#FF3535" size={30} />, count: "0" },
    { title: "Available", icon: <CircleDotIcon color="#4ade80" size={30} />, count: "0" },
    { title: "Occupancy Rate", icon: <ChartNoAxesCombined color="#facc15" size={30} />, count: "0%" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const spotCache = useRef(new Map());
  const zoneCache = useRef(new Map());

  const GET = async (url) => {
    try {
      const r = await axios.get(url);
      return r?.data?.data ?? r?.data ?? null;
    } catch {
      return null;
    }
  };

  const fetchSpotById = async (id) => {
    if (!id) return null;
    if (spotCache.current.has(id)) return spotCache.current.get(id);
    const spot = await GET(`${API}/spots/${id}`);
    if (spot && (spot._id || spot.id)) {
      spotCache.current.set(id, spot);
      return spot;
    }
    return null;
  };

  const fetchZoneById = async (id) => {
    if (!id) return null;
    if (zoneCache.current.has(id)) return zoneCache.current.get(id);
    const zone = await GET(`${API}/zone/${id}`);
    if (zone && (zone._id || zone.id)) {
      zoneCache.current.set(id, zone);
      return zone;
    }
    return null;
  };

  const resolveNames = async (rows) => {
    const spotIds = [
      ...new Set(
        rows.map((r) => readSpotId(r)).filter(Boolean).map(String)
      ),
    ];
    await Promise.all(spotIds.map((id) => fetchSpotById(id)));

    const zoneIds = new Set();
    spotIds.forEach((sid) => {
      const s = spotCache.current.get(sid);
      const zId = s?.zoneId || s?.placeId || s?.place_id || s?.zone_id;
      if (zId) zoneIds.add(String(zId));
    });
    await Promise.all([...zoneIds].map((id) => fetchZoneById(id)));

    return rows.map((r) => {
      const sId = String(readSpotId(r) || "");
      const spot = sId ? spotCache.current.get(sId) : null;
      const zId = spot?.zoneId || spot?.placeId || spot?.place_id || spot?.zone_id || null;
      const zone = zId ? zoneCache.current.get(String(zId)) : null;

      const zoneName =
        zone?.name ||
        r?.zone?.name ||
        r?.place?.name ||
        (zId ? `#${String(zId).slice(-6)}` : "—");

      const spotName =
        spot?.name ||
        spot?.label ||
        r?.spot?.name ||
        r?.spot?.label ||
        (sId ? `#${String(sId).slice(-6)}` : "—");

      return { ...r, __zoneName: zoneName, __spotName: spotName };
    });
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(RES_API);
        let arr = res?.data?.data;
        if (!Array.isArray(arr)) {
          if (Array.isArray(res?.data)) arr = res.data;
          else if (Array.isArray(res?.data?.items)) arr = res.data.items;
        }
        if (!Array.isArray(arr)) {
          setError("Invalid response from /reservations");
          setReservations([]);
          return;
        }

        const raw = arr.map((r, idx) => {
          const s = statusKey(r?.status);
          const status =
            s === "occupied" || s === "confirmed"
              ? "Occupied"
              : s === "reserved"
              ? "Reserved"
              : s === "cancelled"
              ? "Cancelled"
              : s === "completed"
              ? "Completed"
              : "Pending";

        const amount =
          Number.isFinite(r?.amount)
            ? fmtLKR(r.amount)
            : Number.isFinite(r?.price)
            ? fmtLKR(r.price)
            : Number.isFinite(r?.amountCents)
            ? fmtLKR(r.amountCents / 100)
            : "—";

          return {
            _id: r?._id || r?.id || `row-${idx}`,
            spotId: readSpotId(r),
            driverName: r?.driverName,
            plate: r?.plate,
            startTime: r?.startTime,
            endTime: r?.endTime,
            amount,
            vehicle: r?.vehicleType || r?.vehicle || "Car",
            status,
            zone: r?.zone || r?.place || null,
            spot: r?.spot || null,
          };
        });

        const withNames = await resolveNames(raw);

        const rows = withNames.map((r) => ({
          id: r._id,
          owner: displayOwner(r),
          plate: r.plate || "—",
          zone: r.__zoneName,
          spot: r.__spotName,
          time: r.startTime ? new Date(r.startTime).toLocaleString() : "—",
          duration: humanDuration(r.startTime, r.endTime),
          amount: r.amount,
          status: r.status,
        }));

        setReservations(rows);

        const total = rows.length;
        const occupied = rows.filter(
          (x) => x.status === "Occupied" || x.status === "Reserved"
        ).length;
        const available = rows.filter((x) => x.status === "Pending").length;
        const rate = total ? Math.round((occupied / total) * 100) : 0;

        setCards([
          { title: "Total Reservations", icon: <Car color="#2f80ed" size={30} />, count: String(total) },
          { title: "Total Occupied", icon: <CircleDotIcon color="#FF3535" size={30} />, count: String(occupied) },
          { title: "Available", icon: <CircleDotIcon color="#4ade80" size={30} />, count: String(available) },
          { title: "Occupancy Rate", icon: <ChartNoAxesCombined color="#facc15" size={30} />, count: `${rate}%` },
        ]);
      } catch (e) {
        setError(e?.response?.data?.error || e.message || "Failed to load reservations");
        setReservations([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredReservations = useMemo(() => {
    const term = (query || "").trim().toLowerCase();
    if (!term) return reservations;
    return reservations.filter((r) =>
      [r.owner, r.plate, r.zone, r.spot, r.amount, r.status, r.time, r.duration]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term))
    );
  }, [query, reservations]);

  /* ========================= PDF ========================= */
  const downloadPDF = async () => {
    try {
      const rows = (query ? filteredReservations : reservations) ?? [];
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      const headerInfo = {
        ...BUSINESS_INFO,
        logo: LOGO_BASE64 || (await toDataURL("/branding/logo.png")) || null,
      };

      // Compute header height for margins
      const headerBottomY = addBusinessHeader(doc, headerInfo); // draws header on page 1
      const topMargin = headerBottomY + 9;

      // Title + meta on first page
      doc.setFont("helvetica", "bold").setFontSize(12);
      doc.text("Parking Reservations Report", 14, headerBottomY);
      doc.setFont("helvetica", "normal").setFontSize(9);
      const meta = `Generated: ${new Date().toLocaleString()}`;
      doc.text(meta, 14, headerBottomY + 5);

      // Build table
      const head = [["#", "Owner", "Number Plate", "Zone", "Spot", "Start Time", "Duration", "Amount", "Status"]];
      const body = rows.map((r, i) => [
        i + 1,
        r.owner ?? "—",
        r.plate ?? "—",
        r.zone ?? "—",
        r.spot ?? "—",
        r.time ?? "—",
        r.duration ?? "—",
        r.amount ?? "—",
        r.status ?? "—",
      ]);

      autoTable(doc, {
        head,
        body,
        startY: topMargin,
        styles: { font: "helvetica", fontSize: 9, cellPadding: 2, valign: "middle" },
        headStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        theme: "grid",
        margin: { left: 14, right: 14, top: topMargin, bottom: 14 },

        didDrawPage: (data) => {
          if (data.pageNumber > 1) {
            // redraw header for subsequent pages
            addBusinessHeader(doc, headerInfo);
            doc.setFont("helvetica", "bold").setFontSize(12);
            doc.text("Parking Reservations Report", 14, headerBottomY);
            doc.setFont("helvetica", "normal").setFontSize(9);
            const meta2 = `Generated: ${new Date().toLocaleString()}`;
            doc.text(meta2, 14, headerBottomY + 5);
          }
          // footer
          const pageSize = doc.internal.pageSize;
          const pageWidth = pageSize.getWidth();
          const pageHeight = pageSize.getHeight();
          doc.setFontSize(9);
          doc.text(`Page ${data.pageNumber}`, pageWidth - 14, pageHeight - 10, { align: "right" });
        },
      });

      // Save
      const dt = new Date();
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const d = String(dt.getDate()).padStart(2, "0");
      doc.save(`reservation_report_${y}-${m}-${d}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF: " + (err?.message || err));
    }
  };

  if (loading) return <div className="text-white p-5">Loading reservations…</div>;
  if (error) return <div className="text-red-300 p-5">{error}</div>;

  const rowsToRender = query ? filteredReservations : reservations;

  return (
    <div className="">
      {/* Cards */}
      <div className="card grid 2xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-2 gap-3 mx-auto">
        {cards.map((data, index) => (
          <div
            key={index}
            className="bg-white/5 border border-white/10 2xl:w-98 2xl:h-30 lg:w-58 md:w-76 text-white rounded-md p-5"
          >
            <div className="flex justify-between">
              <div className="text-[18px]">{data.title}</div>
              <div className="relative top-5">{data.icon}</div>
            </div>
            <div className="text-2xl mt-1 font-bold">{data.count}</div>
          </div>
        ))}
      </div>

      {/* Table + actions */}
      <div className="mt-10 p-5 bg-white/5 border border-white/10 rounded-md">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-white text-3xl font-bold">
            Parking Reservations ({reservations.length})
            {query && (
              <span className="ml-2 text-sm text-white/60">
                • showing {rowsToRender.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search owner, plate, zone, spot, status…"
              className="w-64 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
            {/* Generate PDF Report */}
            <button
              onClick={downloadPDF}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 hover:bg-white/15 px-3 py-2 text-sm text-white"
              title="Generate PDF (with business header and logo)"
            >
              <CalendarDays size={16} />
              Generate Report
            </button>
          </div>
        </div>

        <table className="mt-5 w-full border border-white/10 text-white rounded-lg">
          <thead className="text-left border-b border-white/10 text-gray-300">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Owner</th>
              <th className="px-4 py-2">Number Plate</th>
              <th className="px-4 py-2">Zone</th>
              <th className="px-4 py-2">Spot</th>
              <th className="px-4 py-2">Start Time</th>
              <th className="px-4 py-2">Duration</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rowsToRender.map((r, i) => (
              <tr key={`${r.id}-${i}`} className="border-t border-white/10 hover:bg-white/5">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">{r.owner}</td>
                <td className="px-4 py-2">{r.plate}</td>
                <td className="px-4 py-2">{r.zone}</td>
                <td className="px-4 py-2">{r.spot}</td>
                <td className="px-4 py-2">{r.time}</td>
                <td className="px-4 py-2">{r.duration}</td>
                <td className="px-4 py-2">{r.amount}</td>
                <td
                  className={`px-4 py-2 font-semibold ${
                    r.status === "Occupied"
                      ? "text-red-400"
                      : r.status === "Reserved"
                      ? "text-yellow-400"
                      : r.status === "Cancelled"
                      ? "text-gray-400"
                      : r.status === "Completed"
                      ? "text-sky-400"
                      : "text-green-400"
                  }`}
                >
                  {r.status}
                </td>
              </tr>
            ))}
            {!reservations.length && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-white/60">
                  No reservations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
