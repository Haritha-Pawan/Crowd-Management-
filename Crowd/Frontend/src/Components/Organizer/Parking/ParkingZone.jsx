// src/pages/ParkingZone.jsx
import React, { useId, useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { MapPin, Car, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const API = "http://localhost:5000/api";
const LIVE_REFRESH_MS = 5000; // poll every 5s

/* ---------- helpers ---------- */
const getColorsByValue = (v) =>
  v >= 70
    ? { progress: "#22c55e", trail: "rgba(34,197,94,0.20)" }
    : v >= 40
    ? { progress: "#f59e0b", trail: "rgba(245,158,11,0.20)" }
    : { progress: "#ef4444", trail: "rgba(239,68,68,0.20)" };

const timeAgo = (iso) => {
  if (!iso) return "Just now";
  const diffMin = Math.max(Math.floor((Date.now() - new Date(iso).getTime()) / 60000), 0);
  if (diffMin < 1) return "Just now";
  if (diffMin === 1) return "1 min ago";
  return `${diffMin} min ago`;
};

const currencyToNumber = (raw) => {
  if (raw === null || raw === undefined) return null;
  const m = String(raw).match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
};

/* ---------- API GET wrapper (with config) ---------- */
const GET = async (url, config) => {
  try {
    const r = await axios.get(url, config);
    return r?.data?.data ?? r?.data ?? null;
  } catch {
    return null;
  }
};

/* ---------- compact donut ---------- */
const ProgressDonut = ({ value = 70, subtitle = "Available", size = 160 }) => {
  const colors = getColorsByValue(value);
  const gradId = useId(); // unique per render tree
  const data = [
    { name: "Progress", value },
    { name: "Remaining", value: Math.max(0, 100 - value) },
  ];
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-white font-semibold text-2xl leading-none">{value}%</span>
        <span className="text-slate-300 text-[10px] mt-0.5">{subtitle}</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id={`progressGradient-${gradId}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={colors.progress} />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="58%"
            outerRadius="74%"
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            isAnimationActive
            animationDuration={700}
            stroke="none"
          >
            <Cell fill={`url(#progressGradient-${gradId})`} />
            <Cell fill={colors.trail} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ---------- occupied logic from spot ---------- */
const statusToOccupied = (spot) => {
  const s = String(spot?.status || "").toLowerCase().replace(/\s|_/g, "");
  const taken = new Set(["occupied", "reserved", "busy", "taken", "unavailable", "confirm", "confirmed", "booked", "inuse"]);
  if (taken.has(s)) return true;
  const free = new Set(["available", "free", "open"]);
  if (free.has(s)) return false;

  if (typeof spot?.isOccupied === "boolean") return spot.isOccupied;
  if (typeof spot?.available === "boolean") return !spot.available;
  if (typeof spot?.isAvailable === "boolean") return !spot.isAvailable;

  const rs = spot?.currentReservation || spot?.activeReservation;
  if (rs?.status) {
    const rsStatus = String(rs.status).toLowerCase().replace(/\s|_/g, "");
    return taken.has(rsStatus);
  }
  return false;
};

const computeCountsFromSpots = (spots) => {
  const total = spots.length;
  const occupied = spots.reduce((acc, s) => acc + (statusToOccupied(s) ? 1 : 0), 0);
  const available = Math.max(0, total - occupied);
  return { total, occupied, available };
};

/* ---------- utils to read a spot's zone/place id ---------- */
const readSpotZoneId = (s) => {
  // flat ids
  const flat = s?.placeId ?? s?.zoneId ?? s?.zone ?? s?.place_id ?? s?.zone_id;
  if (flat) return String(flat);
  // nested objects
  const nested =
    s?.place?._id ?? s?.place?.id ??
    s?.zone?._id ?? s?.zone?.id;
  return nested ? String(nested) : "";
};

/* ---------- fetch spots by zone with guaranteed filtering ---------- */
const fetchSpotsByZone = async (zoneId) => {
  const zid = String(zoneId);
  // Put your real backend param FIRST
  const paramsOrder = ["placeId", "zoneId", "zone"];

  const pullOnce = async (key) => {
    const res = await GET(`${API}/spots`, { params: { [key]: zid, t: Date.now() } });
    let list = Array.isArray(res) ? res
      : Array.isArray(res?.data) ? res.data
      : Array.isArray(res?.items) ? res.items
      : [];

    // Safety: strictly filter to this zoneId even if server returned everything
    list = list.filter((s) => readSpotZoneId(s) === zid);
    return list;
  };

  // Try keys in order; return the first non-empty filtered list
  for (let i = 0; i < paramsOrder.length; i++) {
    const list = await pullOnce(paramsOrder[i]);
    if (list.length > 0) return list;
    // If it's last attempt, return whatever we got (possibly empty) to reflect reality
    if (i === paramsOrder.length - 1) return list;
  }
  return [];
};

/* ---------- zone card ---------- */
const ZoneCard = ({
  name,
  available,
  occupied,
  total,
  updatedAt,
  onView,
  location,
  status,
  type,
  price,
  features,
  distance,
}) => {
  const percent = total > 0 ? Math.round((available / total) * 100) : 0;
  const shownFeatures = Array.isArray(features) ? features.slice(0, 2) : [];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 hover:bg-white/10 transition-all min-h-[390px]">
      {/* top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MapPin size={16} className="text-sky-300" />
          <h3 className="text-white text-base font-semibold leading-tight line-clamp-1">{name}</h3>
        </div>
        <span
          className={`text-[10px] rounded-full px-1.5 py-0.5 ${
            status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          }`}
        >
          {status}
        </span>
      </div>

      {/* meta row */}
      <div className="text-[11px] text-gray-300 mt-1 flex items-center justify-between">
        <span className="truncate">
          {location}
          {distance ? ` (${distance})` : ""}
        </span>
        {updatedAt && <span className="text-gray-500 ml-2 shrink-0">{updatedAt}</span>}
      </div>

      {/* donut */}
      <div className="flex justify-center mt-3">
        <ProgressDonut value={Math.max(0, Math.min(100, percent))} subtitle="Available" size={160} />
      </div>

      {/* counts row */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
          <div className="text-xl font-bold text-white leading-none">{available}</div>
          <div className="text-[10px] text-gray-300 mt-0.5">Avail</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
          <div className="text-xl font-bold text-white leading-none">{occupied}</div>
          <div className="text-[10px] text-gray-300 mt-0.5">Occ</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
          <div className="text-xl font-bold text-white leading-none">{total}</div>
          <div className="text-[10px] text-gray-300 mt-0.5">Cap</div>
        </div>
      </div>

      {/* compact details */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-gray-300">
        <span className="truncate">
          Type: <span className="text-gray-200">{type}</span>
        </span>
        {price && <span className="text-gray-200 font-semibold">{price}</span>}
      </div>

      {/* tiny features (max 2) */}
      {shownFeatures.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {shownFeatures.map((f, i) => (
            <span key={i} className="text-[10px] bg-white/10 text-gray-200 px-1.5 py-0.5 rounded-full">
              {f}
            </span>
          ))}
          {features.length > shownFeatures.length && (
            <span className="text-[10px] text-gray-400">+{features.length - shownFeatures.length}</span>
          )}
        </div>
      )}

      {/* action */}
      <button
        onClick={onView}
        className="mt-4 w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-500 to-emerald-500
                   hover:from-sky-400 hover:to-emerald-400 text-white py-2.5 rounded-xl text-sm font-medium"
      >
        <Car size={16} />
        View Spots
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default function ParkingZone() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // guard against overlapping poll responses overriding newer data
  const fetchSeq = useRef(0);

  const numOrNull = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const getCountsForZone = async (z) => {
    // Try zone-provided counts first
    let total = numOrNull(z.totalSpots);
    if (total === null) total = numOrNull(z.capacity);

    let available = numOrNull(z.availableSpotsLive);
    if (available === null) available = numOrNull(z.availableSpots);

    let occupied = numOrNull(z.occupiedSpots);

    // Always compute from LIVE spots for accuracy
    const zoneId = z._id ?? z.id;
    const spots = await fetchSpotsByZone(zoneId);
    const calc = computeCountsFromSpots(spots);

    total = calc.total;
    occupied = calc.occupied;
    available = calc.available;

    // sanitize
    total = Math.max(0, total ?? 0);
    available = Math.min(total, Math.max(0, available ?? 0));
    occupied = Math.min(total, Math.max(0, occupied ?? 0));
    return { total, available, occupied };
  };

  const normalizeZone = (z, counts) => {
    const { total, available, occupied } = counts ?? { total: 0, available: 0, occupied: 0 };

    const rawPrice = z.price ?? z.pricePerHour ?? z.rate ?? z.zonePrice ?? z.basePrice ?? null;
    const priceValue = currencyToNumber(rawPrice);
    const price = priceValue != null ? `Rs:${priceValue.toFixed(2)}` : rawPrice || "";

    return {
      id: z._id ?? z.id,
      name: z.name || "Unnamed Zone",
      available,
      occupied,
      total,
      updatedAt: z.updatedAt ? timeAgo(z.updatedAt) : "Just now",
      price,
      priceValue,
      features: Array.isArray(z.facilities) ? z.facilities : [],
      location: z.location ?? "",
      status: z.status ?? "active",
      type: z.type ?? "Standard",
      description: z.description ?? "",
      distance: z.distance ?? "",
    };
  };

  const fetchZones = useCallback(async () => {
    const seq = ++fetchSeq.current; // bump sequence
    try {
      setLoading(true);
      const res = await GET(`${API}/zone`, { params: { t: Date.now() } });
      let arr = res;
      if (!Array.isArray(arr)) {
        if (Array.isArray(res?.zones)) arr = res.zones;
        else if (Array.isArray(res?.items)) arr = res.items;
        else if (Array.isArray(res?.data)) arr = res.data;
      }
      if (!Array.isArray(arr)) {
        if (seq !== fetchSeq.current) return; // stale
        setError("Invalid response from the server");
        setZones([]);
        return;
      }

      // build with live counts
      const enriched = await Promise.all(
        arr.map(async (z) => {
          const counts = await getCountsForZone(z);
          return normalizeZone(z, counts);
        })
      );

      if (seq !== fetchSeq.current) return; // ignore stale response
      setZones(enriched);
      setError("");
    } catch (e) {
      console.error("[ParkingZone] fetch error:", e);
      if (seq !== fetchSeq.current) return; // stale
      setError("Failed to load zones");
      setZones([]);
    } finally {
      if (seq === fetchSeq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  // refresh after successful nav actions
  const locationRef = useRef(location.pathname);
  useEffect(() => {
    if (location.state?.success) {
      fetchZones();
      // clear state
      navigate(location.pathname, { replace: true, state: {} });
    }
    locationRef.current = location.pathname;
  }, [location.state, location.pathname, navigate, fetchZones]);

  // LIVE POLLING so donut updates when spots change
  useEffect(() => {
    const id = setInterval(fetchZones, LIVE_REFRESH_MS);
    const onFocus = () => fetchZones();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchZones]);

  if (loading) return <div className="min-h-screen bg-slate-950 text-white p-6">Loading…</div>;
  if (error) return <div className="min-h-screen bg-slate-950 text-red-300 p-6">{error}</div>;

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(59,130,246,0.15),transparent),radial-gradient(1200px_600px_at_90%_10%,rgba(16,185,129,0.12),transparent)] bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <header className="mb-4">
          <h1 className="text-white text-2xl md:text-3xl font-bold">Parking Zones</h1>
          <p className="text-white/70 text-xs md:text-sm mt-1">
            Real-time parking availability and reservation system
          </p>
        </header>

        <section className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {zones.map((z) => (
            <ZoneCard
              key={z.id}
              name={z.name}
              available={z.available}
              occupied={z.occupied}
              total={z.total}
              updatedAt={z.updatedAt}
              location={z.location}
              status={z.status}
              type={z.type}
              price={z.price}
              features={z.features}
              distance={z.distance}
              onView={() => {
                navigate("/zone", {
                  state: {
                    placeId: z.id,
                    zone: z.name,
                    zonePrice: z.priceValue,
                    zonePriceText: z.price,
                  },
                });
              }}
            />
          ))}
        </section>
      </div>
    </div>
  );
}
