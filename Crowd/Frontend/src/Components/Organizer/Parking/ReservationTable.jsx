// src/components/ReservationTable.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Car,
  ChartNoAxesCombined,
  CircleDotIcon,
} from "lucide-react";

const API = "http://localhost:5000/api";
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

const ReservationTable = () => {
  const [reservations, setReservations] = useState([]);
  const [cards, setCards] = useState([
    { title: "Total Reservations", icon: <Car color="#2f80ed" size={30} />, count: "0" },
    { title: "Total Occupied", icon: <CircleDotIcon color="#FF3535" size={30} />, count: "0" },
    { title: "Available", icon: <CircleDotIcon color="#4ade80" size={30} />, count: "0" },
    { title: "Occupancy Rate", icon: <ChartNoAxesCombined color="#facc15" size={30} />, count: "0%" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // simple caches to avoid refetching same ids
  const placeCache = React.useRef(new Map()); // placeId -> {name, ...}
  const spotCache  = React.useRef(new Map()); // spotId  -> {label, placeId}

  // ---------- resolvers ----------
  const fetchPlaceById = async (placeId) => {
    if (!placeId) return null;
    if (placeCache.current.has(placeId)) return placeCache.current.get(placeId);
    try {
      const r = await axios.get(`${API}/places/${placeId}`);
      const place = r?.data?.data || r?.data || null;
      if (place) placeCache.current.set(placeId, place);
      return place;
    } catch {
      return null;
    }
  };

  const fetchSpotById = async (spotId) => {
    if (!spotId) return null;
    if (spotCache.current.has(spotId)) return spotCache.current.get(spotId);

    // Try /spots/:id then /parkingSpots/:id
    const candidates = [`${API}/spots/${spotId}`, `${API}/parkingSpots/${spotId}`];
    for (const url of candidates) {
      try {
        const r = await axios.get(url);
        const spot = r?.data?.data || r?.data || null;
        if (spot && spot._id) {
          spotCache.current.set(spotId, spot);
          return spot;
        }
      } catch {}
    }
    return null;
  };

  // Fallback: if we know the placeId, load all its spots and find our spot
  const fetchSpotViaPlace = async (placeId, spotId) => {
    if (!placeId || !spotId) return null;
    try {
      const r = await axios.get(`${API}/places/${placeId}`, { params: { withSpots: true } });
      const place = r?.data?.data;
      const spots = Array.isArray(place?.spots) ? place.spots : [];
      const hit = spots.find((s) => String(s._id) === String(spotId));
      if (hit) {
        const result = { ...hit, placeId };
        spotCache.current.set(spotId, result);
        return result;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Resolve missing names for an array of reservations
  const resolveNames = async (rows) => {
    // 1) seed caches with any already-provided nested data
    rows.forEach((r) => {
      const pId = r.placeId || r?.place?._id;
      if (pId && r?.place?.name) {
        placeCache.current.set(String(pId), r.place);
      }
      const sId = r.spotId || r?.spot?._id;
      if (sId && r?.spot?.label) {
        spotCache.current.set(String(sId), r.spot);
      }
    });

    // 2) collect unresolved ids
    const missingPlaceIds = new Set();
    const missingSpotIds  = new Set();
    rows.forEach((r) => {
      const pId = String(r.placeId || r?.place?._id || "");
      const sId = String(r.spotId || r?.spot?._id || "");
      if (pId && !placeCache.current.has(pId)) missingPlaceIds.add(pId);
      if (sId && !spotCache.current.has(sId))  missingSpotIds.add(sId);
    });

    // 3) resolve places first
    await Promise.all([...missingPlaceIds].map((id) => fetchPlaceById(id)));

    // 4) resolve spots; prefer spot-by-id; fallback via place->spots
    await Promise.all(
      [...missingSpotIds].map(async (sId) => {
        let spot = await fetchSpotById(sId);
        if (spot) return spot;
        // find any row that references this spot to get its placeId
        const ref = rows.find((r) => String(r.spotId || r?.spot?._id) === String(sId));
        const placeId = ref?.placeId || ref?.place?._id;
        if (placeId) {
          return await fetchSpotViaPlace(placeId, sId);
        }
        return null;
      })
    );

    // 5) return rows with injected names
    return rows.map((r) => {
      const pId = String(r.placeId || r?.place?._id || "");
      const sId = String(r.spotId || r?.spot?._id || "");

      const place = pId ? placeCache.current.get(pId) : null;
      const spot  = sId ? spotCache.current.get(sId)   : null;

      return {
        ...r,
        __resolvedPlaceName: place?.name || r?.place?.name || r?.placeName || r?.zone || "—",
        __resolvedSpotLabel: spot?.label || r?.spot?.label || r?.spotLabel || "—",
      };
    });
  };

  // ---------- fetch + normalize ----------
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

        // normalize raw
        const raw = arr.map((r, idx) => ({
          _id: r?._id || r?.id || `row-${idx}`,
          placeId: r?.placeId || r?.place?._id || r?.place_id,
          spotId:  r?.spotId  || r?.spot?._id  || r?.spot_id,
          vehicle: r?.vehicleType || r?.vehicle || "Car",
          owner:
            r?.user?.name ||
            r?.ownerName ||
            r?.owner ||
            r?.customerName ||
            "—",
          startTime: r?.startTime,
          endTime:   r?.endTime,
          amount:
            Number.isFinite(r?.amount)
              ? fmtLKR(r.amount)
              : Number.isFinite(r?.price)
              ? fmtLKR(r.price)
              : Number.isFinite(r?.amountCents)
              ? fmtLKR(r.amountCents / 100)
              : "—",
          status: (() => {
            const s = statusKey(r?.status);
            if (s === "occupied") return "Occupied";
            if (s === "reserved") return "Reserved";
            if (s === "cancelled") return "Cancelled";
            if (s === "completed") return "Completed";
            if (s === "confirmed") return "Occupied";
            return "Pending";
          })(),
          place: r?.place, // keep any nested
          spot:  r?.spot,  // keep any nested
        }));

        // resolve names
        const withNames = await resolveNames(raw);

        // final render rows
        const rows = withNames.map((r, i) => ({
          id: r._id,
          vehicle: r.vehicle,
          owner: r.owner,
          zone: r.__resolvedPlaceName,
          spot: r.__resolvedSpotLabel,
          time: r.startTime ? new Date(r.startTime).toLocaleString() : "—",
          duration: humanDuration(r.startTime, r.endTime),
          amount: r.amount,
          status: r.status,
        }));

        setReservations(rows);

        // compute KPIs
        const total = rows.length;
        const occupied = rows.filter(
          (x) => x.status === "Occupied" || x.status === "Reserved"
        ).length; // count reserved as taken in KPI
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
        setError(
          e?.response?.data?.error || e.message || "Failed to load reservations"
        );
        setReservations([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-white p-5">Loading reservations…</div>;
  if (error)   return <div className="text-red-300 p-5">{error}</div>;

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

      {/* Table */}
      <div className="mt-10 p-5 bg-white/5 border border-white/10 rounded-md">
        <div className="text-white text-3xl font-bold">
          Parking Reservations ({reservations.length})
        </div>

        <table className="mt-5 w-full border border-white/10 text-white rounded-lg">
          <thead className="text-left border-b border-white/10 text-gray-300">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Vehicle</th>
              <th className="px-4 py-2">Owner</th>
              <th className="px-4 py-2">Zone</th>
              <th className="px-4 py-2">Spot</th>
              <th className="px-4 py-2">Start Time</th>
              <th className="px-4 py-2">Duration</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r, i) => (
              <tr key={r.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">{r.vehicle}</td>
                <td className="px-4 py-2">{r.owner}</td>
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
};

export default ReservationTable;
