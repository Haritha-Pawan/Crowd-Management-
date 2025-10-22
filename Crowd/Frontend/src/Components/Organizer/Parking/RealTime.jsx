// src/pages/RealTime.jsx
import { Car, ChartNoAxesCombined, CircleDotIcon } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

/* ---------- tiny helpers ---------- */
const norm = (v) => String(v ?? "").trim().toLowerCase();
const currencyToNumber = (raw) => {
  if (raw === null || raw === undefined) return null;
  const m = String(raw).match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
};
const numberToCurrency = (n) => `Rs:${Number(n || 0).toFixed(2)}`;

/* Normalize zone name to a stable key when zoneId missing
   - lowercases
   - trims
   - drops " - ... " suffixes (e.g., "Zone A - Main Entrance" -> "zone a") */
const zoneKeyFromText = (s) => {
  const txt = norm(s.zoneName ?? s.zone ?? "");
  if (!txt) return "";
  // keep the part before " - "
  const base = txt.split(/\s*-\s*/)[0];
  // collapse spaces & non-alnum to single dashes
  return base.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
};

/* Extract a numeric spot index from spotNumber or label (to unify "Spot 01", "spot-1", etc.) */
const spotNumberFrom = (s) => {
  if (s.spotNumber != null && Number.isFinite(+s.spotNumber)) return +s.spotNumber;
  const m = String(s.label ?? "").match(/\d+/);
  return m ? +m[0] : null;
};

/* Build a composite key to identify the physical spot */
const buildSpotKey = (raw) => {
  // 1) True ids
  if (raw._id) return String(raw._id);
  if (raw.id) return String(raw.id);
  if (raw.sensorId) return `sensor:${raw.sensorId}`;
  if (raw.hardwareId) return `hw:${raw.hardwareId}`;
  if (raw.deviceId) return `dev:${raw.deviceId}`;

  // 2) Zone + spotNumber (best effort)
  const zoneKey = norm(raw.zoneId) || zoneKeyFromText(raw);
  const num = spotNumberFrom(raw);
  if (num != null) return `${zoneKey}::num:${num}`;

  // 3) Zone + normalized label fallback
  const labelKey = norm(raw.label).replace(/[^a-z0-9]+/g, "-");
  if (labelKey) return `${zoneKey}::lbl:${labelKey}`;

  // 4) Coordinates fallback (rounded)
  const lat = raw.lat ?? raw.latitude ?? raw.coords?.lat;
  const lng = raw.lng ?? raw.longitude ?? raw.coords?.lng;
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `${zoneKey}::geo:${(+lat).toFixed(5)},${(+lng).toFixed(5)}`;
  }

  // 5) Fingerprint
  return `${zoneKey}::fp:${JSON.stringify({
    name: norm(raw.name ?? raw.label),
    type: norm(raw.type),
  })}`;
};

/* Status priority for merging duplicates */
const statusPriority = (st) => {
  const s = norm(st);
  if (s === "reserved") return 4;
  if (s === "occupied") return 3;
  if (s === "unavailable" || s === "blocked") return 2;
  return 1; // available or unknown -> lowest
};

/* Pick the best of two duplicates:
   - newer updatedAt wins
   - if tie, higher status priority wins
   - else keep existing */
const pickBetter = (a, b) => {
  const ta = a.updatedAt || 0;
  const tb = b.updatedAt || 0;
  if (tb > ta) return b;
  if (tb < ta) return a;
  const sa = statusPriority(a.status);
  const sb = statusPriority(b.status);
  if (sb > sa) return b;
  return a;
};

/* Map raw API spot -> view model */
const mapSpotToView = (s, i) => {
  const priceNum = currencyToNumber(
    s.price ?? s.pricePerHour ?? s.rate ?? s.amount
  );

  let status = norm(s.status);
  if (!status) {
    status =
      s.available !== undefined ? (s.available ? "available" : "occupied") : "available";
  }

  // Robust timestamp parsing (supports a few field names)
  const ts =
    (s.updatedAt && Date.parse(s.updatedAt)) ||
    (s.lastUpdated && Date.parse(s.lastUpdated)) ||
    (s.updated_time && Date.parse(s.updated_time)) ||
    (s.ts && Date.parse(s.ts)) ||
    0;

  const key = buildSpotKey(s);

  return {
    key,                                        // stable dedupe/render key
    id: s._id ?? s.id ?? key,                   // fallback id = key
    name: s.label || `Spot ${s.spotNumber ?? i + 1}`,
    status,                                     // "available" | "occupied" | "reserved"
    zone: s.zoneName || s.zone || "",
    priceText: numberToCurrency(priceNum),
    distance: s.distanceText || `${30 + i * 2}m`, // placeholder unless backend provides distance
    type: s.type ?? "Standard",
    features: Array.isArray(s.facilities) ? s.facilities : [],
    updatedAt: Number.isFinite(ts) ? ts : 0,
  };
};

/* Deduplicate by composite key; merge with pickBetter() */
const dedupeSpots = (arr) => {
  const m = new Map();
  for (const s of arr) {
    const prev = m.get(s.key);
    if (!prev) m.set(s.key, s);
    else m.set(s.key, pickBetter(prev, s));
  }
  return Array.from(m.values());
};

/* ---------- API ---------- */
async function fetchAllSpots() {
  // cache-buster `t` avoids stale responses during dev
  const res = await axios.get(`${API}/spots`, { params: { t: Date.now() } });
  const raw = res?.data?.data ?? res?.data ?? [];
  return Array.isArray(raw) ? raw : [];
}

const RealTime = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [spots, setSpots] = useState([]);

  const loadSpots = useCallback(async () => {
    try {
      setLoading(true);
      const raw = await fetchAllSpots();
      const mapped = raw.map(mapSpotToView);
      const unique = dedupeSpots(mapped);
      setSpots(unique);
      setError("");
    } catch (e) {
      console.error("[RealTime] fetch error:", e);
      setError(e?.response?.data?.error || e.message || "Failed to load spots");
      setSpots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadSpots();
  }, [loadSpots]);

  // Auto-poll every 4000 ms
  useEffect(() => {
    const id = setInterval(loadSpots, 4000);
    return () => clearInterval(id);
  }, [loadSpots]);

  // Refresh on focus / visibility
  useEffect(() => {
    const onFocus = () => loadSpots();
    const onVis = () => document.visibilityState === "visible" && loadSpots();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [loadSpots]);

  // Stats
  const stats = useMemo(() => {
    const total = spots.length;
    const occupied = spots.filter((s) => s.status !== "available").length;
    const available = total - occupied;
    const occRate = total ? Math.round((occupied / total) * 100) : 0;
    return { total, occupied, available, occRate };
  }, [spots]);

  const cards = useMemo(
    () => [
      { title: "Total Counters", icon: <Car color="#2f80ed" size={30} />, count: String(stats.total) },
      { title: "Total Occupied", icon: <CircleDotIcon color="#FF3535" size={30} />, count: String(stats.occupied) },
      { title: "Available",      icon: <CircleDotIcon color="#4ade80" size={30} />, count: String(stats.available) },
      { title: "Occupancy Rate", icon: <ChartNoAxesCombined color="#facc15" size={30} />, count: `${stats.occRate}%` },
    ],
    [stats]
  );

  if (loading && spots.length === 0) {
    return <div className="text-white/80 p-6">Loading real-time spots…</div>;
  }
  if (error && spots.length === 0) {
    return (
      <div className="text-red-300 p-6">
        {error}{" "}
        <button
          onClick={loadSpots}
          className="ml-2 inline-flex items-center px-3 py-1 rounded-md bg-white/10 text-white hover:bg-white/15 border border-white/10"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="">
      {/* Stats cards */}
      <div className="card grid 2xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-2 gap-3 mx-auto">
        {cards.map((c, idx) => (
          <div
            key={idx}
            className="bg-white/5 border border-white/10 2xl:w-98 2xl:h-30 lg:w-58 md:w-76 text-white rounded-md p-5"
          >
            <div className="icon flex justify-between">
              <div className="title text-[18px]">{c.title}</div>
              <div className="icon relative top-5">{c.icon}</div>
            </div>
            <div className="count text-2xl mt-1 font-bold">{c.count}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-5 bg-white/5 border border-white/10 rounded-md">
        <div className="flex items-center justify-between">
          <div className="text-white text-3xl font-bold">Real-time Parking Status</div>
          <div className="flex items-center gap-3">
            {loading && <span className="text-white/60 text-sm">Refreshing…</span>}
            <button
              onClick={loadSpots}
              className="text-sm rounded-md px-3 py-1 border border-white/10 text-white/90 bg-white/10 hover:bg-white/15"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="spot grid 2xl:grid-cols-4 xl:grid-cols-4 max-sm:grid-cols-1 gap-10">
          {spots.map((spot) => (
            <div
              key={spot.key}
              className={`spot-Area p-3 rounded-md border border-white/10 mt-10 backdrop-blur-md
                ${
                  spot.status === "available"
                    ? "bg-green-500/15"
                    : spot.status === "reserved"
                    ? "bg-yellow-500/10"
                    : "bg-red-500/15"
                }`}
            >
              <div className="spot-Name text-white font-bold flex justify-between text-[14px] mb-1">
                {spot.name}
                <div
                  className={
                    spot.status === "available"
                      ? "border border-green-500/20 bg-green-500/20 p-1 rounded-full text-xs px-2 text-green-400"
                      : spot.status === "reserved"
                      ? "border border-yellow-500/20 bg-yellow-500/20 p-1 rounded-full text-xs px-2 text-yellow-400"
                      : "bg-red-500/20 border border-red-800/20 p-1 rounded-full text-xs px-2 text-red-500"
                  }
                >
                  {spot.status}
                </div>
              </div>

              <div className="zone text-(--color-secondary) text-[13px]">{spot.zone}</div>

              <div className="details mt-5">
                <div className="price flex justify-between mb-4 text-[13px]">
                  Price per Hour
                  <div className="price text-white">100.00</div>
                </div>

                <div className="Distance flex justify-between mb-4 text-[13px]">
                  Distance
                  <div className="Distance text-white">{spot.distance}</div>
                </div>

                <div className="TypeRow flex justify-between mb-4 text-[13px]">
                  Type
                  <div className="Type text-white">{spot.type}</div>
                </div>

                <div className="features-container mb-2">
                  <div className="flex flex-wrap gap-2">
                    {spot.features.length === 0 && (
                      <span className="text-xs text-gray-400"></span>
                    )}
                    {spot.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="features bg-white/10 px-2 py-1 border-white/5 text-gray-300 text-xs rounded-full font-semibold"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default RealTime;
