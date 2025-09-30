// src/pages/ParkingZone.jsx
import React, { useId, useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { MapPin, Car, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

/* ---------- compact mode knobs ---------- */
const MAX_FEATURES = 3;        // show at most 3 chips; rest becomes “+N more”
const HEADER_TIGHT = true;     // smaller page header
const CARD_PADDING = "p-4";    // was p-5
const GAP = "gap-4";           // was gap-6

/* ---------- helpers ---------- */
const getColorsByValue = (v) =>
  v >= 70
    ? { progress: "#22c55e", trail: "rgba(34,197,94,0.20)" }
    : v >= 40
    ? { progress: "#f59e0b", trail: "rgba(245,158,11,0.20)" }
    : { progress: "#ef4444", trail: "rgba(239,68,68,0.20)" };

const timeAgo = (iso) => {
  if (!iso) return "Just now";
  const diffMin = Math.max(
    Math.floor((Date.now() - new Date(iso).getTime()) / 60000),
    0
  );
  if (diffMin < 1) return "Just now";
  if (diffMin === 1) return "1 min ago";
  return `${diffMin} min ago`;
};

/* Responsive donut size (keeps card short) */
const useDonutSize = () => {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const onR = () => setW(window.innerWidth);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  if (w < 360) return 110;
  if (w < 640) return 120;     // sm
  if (w < 1024) return 150;    // md
  return 180;                  // lg+
};

const ProgressDonut = ({ value = 70, subtitle = "Available", size = 180 }) => {
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
        <span className="text-slate-300 text-[11px] mt-1">{subtitle}</span>
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
            innerRadius="64%"
            outerRadius="80%"
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

const ZoneCard = ({
  name,
  available,
  reserved,
  total,
  updatedAt,
  onView,
  location,
  status,
  type,
  price,
  features,
  distance,
  donutSize,
}) => {
  const percent = total > 0 ? Math.round((available / total) * 100) : 0;
  const shown = Array.isArray(features) ? features.slice(0, MAX_FEATURES) : [];
  const hidden = Math.max((features?.length || 0) - shown.length, 0);

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md ${CARD_PADDING} hover:bg-white/10 hover:shadow-lg transition-all`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin size={16} className="text-sky-300 shrink-0" />
          <h3 className="text-white text-base font-semibold truncate">{name}</h3>
        </div>
        <span
          className={`text-[10px] rounded-full px-2 py-0.5 ${
            status === "active"
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {status}
        </span>
      </div>

      {/* Meta (single line, clamped) */}
      <div className="text-[12px] text-gray-300 mt-1 line-clamp-1">
        {location}{distance ? ` (${distance})` : ""} • Type: {type}
      </div>
      {updatedAt && (
        <div className="text-[11px] text-gray-500 mt-0.5">Updated {updatedAt}</div>
      )}

      {/* Donut */}
      <div className="flex justify-center mt-3">
        <ProgressDonut
          value={Math.max(0, Math.min(100, percent))}
          subtitle="Available"
          size={donutSize}
        />
      </div>

      {/* Stats (more compact) */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white/5 border border-white/10 p-2 text-center">
          <div className="text-xl font-semibold text-white">{available}</div>
          <div className="text-[11px] text-gray-300">Available</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-2 text-center">
          <div className="text-xl font-semibold text-white">{reserved}</div>
          <div className="text-[11px] text-gray-300">Reserved</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-2 text-center">
          <div className="text-xl font-semibold text-white">{total}</div>
          <div className="text-[11px] text-gray-300">Capacity</div>
        </div>
      </div>

      {/* Facilities (first 3 + "+N more") */}
      {(shown.length > 0 || hidden > 0) && (
        <div className="mt-3">
          <div className="text-[12px] font-medium text-gray-300 mb-1">Facilities</div>
          <div className="flex flex-wrap gap-1.5">
            {shown.map((f, i) => (
              <span
                key={i}
                className="text-[11px] bg-white/10 text-gray-200 px-2 py-1 rounded-md"
              >
                {f}
              </span>
            ))}
            {hidden > 0 && (
              <span className="text-[11px] bg-white/10 text-gray-400 px-2 py-1 rounded-md">
                +{hidden} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Price & CTA row (smaller) */}
      <div className="mt-3 flex items-center justify-between">
        {price && (
          <div className="text-center">
            <span className="text-xl font-semibold text-white">{price}</span>
            <span className="text-gray-300 text-xs ml-1">/slot</span>
          </div>
        )}
        <button
          onClick={onView}
          className="ml-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-emerald-500
                     hover:from-sky-400 hover:to-emerald-400 text-white py-2 px-3 rounded-xl text-sm font-medium"
        >
          <Car size={16} />
          View Spots
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};

const ParkingZone = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const donutSize = useDonutSize();

  // number helper (returns null if not numeric)
  const numOrNull = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/places`);

        // Accept {data: [...]}, [...] , {zones: [...]}, {items: [...]}
        let arr = res?.data?.data;
        if (!Array.isArray(arr)) {
          if (Array.isArray(res?.data)) arr = res.data;
          else if (Array.isArray(res?.data?.zones)) arr = res.data.zones;
          else if (Array.isArray(res?.data?.items)) arr = res.data.items;
        }
        if (!Array.isArray(arr)) {
          console.error("[ParkingZone] Unexpected response:", res?.data);
          setError("Invalid response from the server");
          setLoading(false);
          return;
        }

        const normalized = arr.map((z) => {
          // Live fields from controller
          let total = numOrNull(z.totalSpots);
          if (total === null) total = numOrNull(z.capacity) ?? 0;

          let available = numOrNull(z.availableSpotsLive);
          if (available === null) available = numOrNull(z.availableSpots); // legacy

          let occupied = numOrNull(z.occupiedSpots);
          

          console.log({ total, available, occupied, reserved });
          // Derive missing values
          if (reserved === null && total !== null && available !== null && occupied !== null) {
            reserved = Math.max(0, total - available - occupied);
          }
          if (occupied === null && total !== null && available !== null && reserved !== null) {
            occupied = Math.max(0, total - available - reserved);
          }
          if (available === null && total !== null && occupied !== null && reserved !== null) {
            available = Math.max(0, total - occupied - reserved);
          }

          // Clamp
          total = Math.max(0, total ?? 0);
          available = Math.min(total, Math.max(0, available ?? 0));
          reserved = Math.min(total, Math.max(0, reserved ?? 0));

          const priceNum = Number(z.price);
          const price =
            Number.isFinite(priceNum) ? `Rs:${priceNum.toFixed(2)}` : (z.price ? `Rs:${z.price}` : "");

          const features = Array.isArray(z.facilities)
            ? z.facilities
            : typeof z.facilities === "string" && z.facilities.trim()
            ? z.facilities.split(",").map((s) => s.trim())
            : [];

          return {
            id: z._id ?? z.id,
            name: z.name || "Unnamed Zone",
            available,
            reserved,
            total,
            updatedAt: z.updatedAt ? timeAgo(z.updatedAt) : "Just now",
            price,
            features,
            location: z.location ?? "",
            status: z.status ?? "active",
            type: z.type ?? "Standard",
            description: z.description ?? "",
            distance: z.distance ?? "",
          };
        });

        setZones(normalized);
        setError("");
      } catch (e) {
        console.error("[ParkingZone] fetch error:", e);
        setError("Failed to load zones");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return <div className="min-h-screen bg-slate-950 text-white p-6">Loading…</div>;
  if (error)
    return <div className="min-h-screen bg-slate-950 text-red-300 p-6">{error}</div>;

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(59,130,246,0.15),transparent),radial-gradient(1200px_600px_at_90%_10%,rgba(16,185,129,0.12),transparent)] bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <header className={`mb-4 ${HEADER_TIGHT ? "" : "mb-6"}`}>
          <h1 className={`text-white ${HEADER_TIGHT ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"} font-bold`}>
            Parking Zones
          </h1>
          <p className="text-white/70 text-sm md:text-[15px] mt-1">
            Real-time parking availability and reservation system
          </p>
        </header>


        <div className="text-center mt-1 text-white text-xl font-semibold">Choose Your Location</div>
        <div className="text-center mt-0.5 text-gray-300 text-sm md:text-base font-medium">
          Select a parking area to view available spots in real-time
        </div>

        {/* Tighter grid gaps to keep first row fully visible without page scroll */}
        <section className={`mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${GAP}`}>
          {zones.map((z) => (
            <ZoneCard
              key={z.id}
              name={z.name}
              available={z.available}
              reserved={z.reserved}
              total={z.total}
              updatedAt={z.updatedAt}
              location={z.location}
              status={z.status}
              type={z.type}
              price={z.price}
              features={z.features}
              distance={z.distance}
              donutSize={donutSize}
              onView={() => {
                navigate("/zone", {
                  state: {
                    placeId: z.id,
                    zone: z.name,
                    capacity: z.total,
                    reserved: z.reserved,
                    available: z.available,
                    price: z.price,
                    features: z.features,
                    location: z.location,
                    status: z.status,
                    type: z.type,
                    distance: z.distance,
                  },
                });
              }}
            />
          ))}
        </section>

        {zones.length === 0 && (
          <div className="text-center text-gray-300 mt-4">No zones found</div>
        )}
      </div>
    </div>
  );
};

export default ParkingZone;
