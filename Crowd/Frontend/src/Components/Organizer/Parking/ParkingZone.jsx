// src/pages/ParkingZone.jsx
import React, { useId, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { MapPin, Car, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const API = "http://localhost:5000/api";

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

/* ---------- compact donut ---------- */
const ProgressDonut = ({ value = 70, subtitle = "Available", size = 140 }) => {
  const colors = getColorsByValue(value);
  const gradId = useId();
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

/* ---------- compact card ---------- */
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
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-3 hover:bg-white/10 transition-all">
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
      <div className="flex justify-center mt-2">
        <ProgressDonut value={Math.max(0, Math.min(100, percent))} subtitle="Available" size={130} />
      </div>

      {/* counts row */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white/5 border border-white/10 p-2 text-center">
          <div className="text-lg font-bold text-white leading-none">{available}</div>
          <div className="text-[10px] text-gray-300 mt-0.5">Avail</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-2 text-center">
          <div className="text-lg font-bold text-white leading-none">{occupied}</div>
          <div className="text-[10px] text-gray-300 mt-0.5">Occ</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-2 text-center">
          <div className="text-lg font-bold text-white leading-none">{total}</div>
          <div className="text-[10px] text-gray-300 mt-0.5">Cap</div>
        </div>
      </div>

      {/* compact details */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-gray-300">
        <span className="truncate">Type: <span className="text-gray-200">{type}</span></span>
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
        className="mt-3 w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-500 to-emerald-500
                   hover:from-sky-400 hover:to-emerald-400 text-white py-2 rounded-xl text-sm font-medium"
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

  const numOrNull = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const normalizeZone = (z) => {
    // counts
    let total = numOrNull(z.totalSpots);
    if (total === null) total = numOrNull(z.capacity) ?? 0;

    let available = numOrNull(z.availableSpotsLive);
    if (available === null) available = numOrNull(z.availableSpots);

    let occupied = numOrNull(z.occupiedSpots);
    if (occupied === null && total !== null && available !== null) {
      occupied = Math.max(0, total - available);
    }

    total = Math.max(0, total ?? 0);
    available = Math.min(total, Math.max(0, available ?? 0));
    occupied = Math.min(total, Math.max(0, occupied ?? 0));

    // price
    const rawPrice = z.price ?? z.pricePerHour ?? z.rate ?? z.zonePrice ?? z.basePrice ?? null;
    const priceValue = currencyToNumber(rawPrice);
    const price = priceValue != null ? `Rs:${priceValue.toFixed(2)}` : (rawPrice || "");

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
    try {
      setLoading(true);
      const res = await axios.get(`${API}/zone`, { params: { t: Date.now() } });
      let arr = res?.data?.data;
      if (!Array.isArray(arr)) {
        if (Array.isArray(res?.data)) arr = res.data;
        else if (Array.isArray(res?.data?.zones)) arr = res.data.zones;
        else if (Array.isArray(res?.data?.items)) arr = res.data.items;
      }
      if (!Array.isArray(arr)) {
        setError("Invalid response from the server");
        setZones([]);
      } else {
        setZones(arr.map(normalizeZone));
        setError("");
      }
    } catch (e) {
      console.error("[ParkingZone] fetch error:", e);
      setError("Failed to load zones");
      setZones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  useEffect(() => {
    if (location.state?.success) {
      fetchZones();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate, fetchZones]);

  if (loading) return <div className="min-h-screen bg-slate-950 text-white p-6">Loading…</div>;
  if (error) return <div className="min-h-screen bg-slate-950 text-red-300 p-6">{error}</div>;

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(59,130,246,0.15),transparent),radial-gradient(1200px_600px_at_90%_10%,rgba(16,185,129,0.12),transparent)] bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">{/* tighter vertical padding */}
        <header className="mb-3">
          <h1 className="text-white text-2xl md:text-3xl font-bold">Parking Zones</h1>
          <p className="text-white/70 text-xs md:text-sm mt-1">
            Real-time parking availability and reservation system
          </p>
        </header>

        {/* tighter grid and gap so more fits above the fold */}
        <section className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                // pass only the zone price details
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
