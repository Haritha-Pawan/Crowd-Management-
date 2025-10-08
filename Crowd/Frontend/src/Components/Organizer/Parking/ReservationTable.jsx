// src/components/ReservationTable.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Car,
  ChartNoAxesCombined,
  CircleDotIcon,
  CalendarDays,
} from "lucide-react";

const API = "http://localhost:5000/api";
const RES_API = `${API}/reservations`;

console.log("Using RES_API:", RES_API);

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

/* ------------------------- Owner display ------------------------- */
const displayOwner = (r) => {
  if (r?.driverName) return r.driverName; // your payload field
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

/* ------------------------- ID helpers ------------------------- */
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

  // Search
  const [query, setQuery] = useState("");

  // Caches
  const spotCache = useRef(new Map()); // spotId -> spot
  const zoneCache = useRef(new Map()); // zoneId/placeId -> zone

  // Generic GET wrapper
  const GET = async (url) => {
    try {
      const r = await axios.get(url);
      return r?.data?.data ?? r?.data ?? null;
    } catch (e) {
      return null;
    }
  };

  // Fetch spot, cache
  const fetchSpotById = async (id) => {
    if (!id) return null;
    if (spotCache.current.has(id)) return spotCache.current.get(id);
    const spot = await GET(`${API}/spots/${id}`);
    if (spot && (spot._id || spot.id)) {
      spotCache.current.set(id, spot);
      return spot;
    }
    console.warn("[spot] not found:", id);
    return null;
  };

  // Fetch zone, cache (your route: /api/zone/:id)
  const fetchZoneById = async (id) => {
    if (!id) return null;
    if (zoneCache.current.has(id)) return zoneCache.current.get(id);
    const zone = await GET(`${API}/zone/${id}`);
    if (zone && (zone._id || zone.id)) {
      zoneCache.current.set(id, zone);
      return zone;
    }
    console.warn("[zone] not found:", id);
    return null;
  };

  // Resolve Zone & Spot display names for rows
  const resolveNames = async (rows) => {
    // Step 1: ensure all spots loaded
    const spotIds = [
      ...new Set(
        rows
          .map((r) => readSpotId(r))
          .filter(Boolean)
          .map(String)
      ),
    ];
    await Promise.all(spotIds.map((id) => fetchSpotById(id)));

    // Step 2: gather zone ids from spots (support spot.zoneId or spot.placeId)
    const zoneIds = new Set();
    spotIds.forEach((sid) => {
      const s = spotCache.current.get(sid);
      const zId = s?.zoneId || s?.placeId || s?.place_id || s?.zone_id;
      if (zId) zoneIds.add(String(zId));
    });

    // Step 3: ensure all zones loaded
    await Promise.all([...zoneIds].map((id) => fetchZoneById(id)));

    // Step 4: return rows with resolved names
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

      return {
        ...r,
        __zoneName: zoneName,
        __spotName: spotName,
      };
    });
  };

  // Fetch + normalize
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

        // Normalize rows from API
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
            // keep any nested objects if present
            zone: r?.zone || r?.place || null,
            spot: r?.spot || null,
          };
        });

        const withNames = await resolveNames(raw);

        const rows = withNames.map((r) => ({
          id: r._id,
          owner: displayOwner(r),                 // Owner = driverName (fallbacks)
          plate: r.plate || "—",                  // Number plate column
          zone: r.__zoneName,                     // Zone name
          spot: r.__spotName,                     // Spot name
          time: r.startTime ? new Date(r.startTime).toLocaleString() : "—",
          duration: humanDuration(r.startTime, r.endTime),
          amount: r.amount,
          status: r.status,
        }));

        setReservations(rows);

        // KPIs
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
        console.error("[ReservationTable] fetch error:", e);
        setError(e?.response?.data?.error || e.message || "Failed to load reservations");
        setReservations([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ------------------------- Search ------------------------- */
  const filteredReservations = useMemo(() => {
    const term = (query || "").trim().toLowerCase();
    if (!term) return reservations;
    return reservations.filter((r) =>
      [r.owner, r.plate, r.zone, r.spot, r.amount, r.status, r.time, r.duration]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term))
    );
  }, [query, reservations]);

  /* ------------------------- Generate Report (CSV) ------------------------- */
  const downloadCSV = () => {
    const rows = filteredReservations.length ? filteredReservations : reservations;
    const header = ["#", "Owner", "Number Plate", "Zone", "Spot", "Start Time", "Duration", "Amount", "Status"];
    const body = rows.map((r, idx) => [
      idx + 1,
      r.owner,
      r.plate,
      r.zone,
      r.spot,
      r.time,
      r.duration,
      r.amount,
      r.status,
    ]);

    const csv = [header, ...body]
      .map((row) =>
        row
          .map((cell) => {
            const val = cell == null ? "" : String(cell);
            const escaped = val.replace(/"/g, '""');
            return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const dt = new Date();
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    a.download = `reservation_report_${y}-${m}-${d}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
            {/* Generate Report (CSV) */}
            <button
              onClick={downloadCSV}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 hover:bg-white/15 px-3 py-2 text-sm text-white"
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
