// src/pages/ParkingZone.jsx
import React, { useId, useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { MapPin, Car, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const diffMin = Math.max(
    Math.floor((Date.now() - new Date(iso).getTime()) / 60000),
    0
  );
  if (diffMin < 1) return "Just now";
  if (diffMin === 1) return "1 min ago";
  return `${diffMin} min ago`;
};

const ProgressDonut = ({ value = 70, subtitle = "Available", size = 220 }) => {
  const colors = getColorsByValue(value);
  const gradId = useId();
  const data = [
    { name: "Progress", value },
    { name: "Remaining", value: Math.max(0, 100 - value) },
  ];
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-white font-bold text-3xl leading-none">{value}%</span>
        <span className="text-slate-300 text-xs mt-1">{subtitle}</span>
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
            innerRadius="62%"
            outerRadius="80%"
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            isAnimationActive
            animationDuration={900}
            stroke="none"
          >
            <Cell fill={`url(#progressGradient-${gradId})`} />
            <Cell fill={colors.trail} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div
        className="pointer-events-none absolute inset-0 rounded-full blur-2xl"
        style={{ boxShadow: "0 0 40px rgba(56,189,248,0.18)" }}
      />
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
}) => {
  const percent = total > 0 ? Math.round((available / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 hover:bg-white/10 hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-sky-300" />
          <h3 className="text-white text-lg font-semibold">{name}</h3>
        </div>
        <span
          className={`text-xs rounded-full px-2 py-0.5 ${
            status === "active"
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="text-sm text-gray-300 mb-4">
        <div className="flex items-center gap-1">
          <MapPin size={14} className="text-gray-400" />
          {location} {distance ? `(${distance})` : ""}
        </div>
        <div className="text-sm text-gray-400 mt-1">Type: {type}</div>
        {updatedAt && (
          <div className="text-xs text-gray-500 mt-1">Updated {updatedAt}</div>
        )}
      </div>

      <div className="flex justify-center">
        <ProgressDonut
          value={Math.max(0, Math.min(100, percent))}
          subtitle="Available"
          size={220}
        />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
          <div className="text-2xl font-bold text-white">{available}</div>
          <div className="text-xs text-gray-300">Available</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
          <div className="text-2xl font-bold text-white">{reserved}</div>
          <div className="text-xs text-gray-300">Reserved</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
          <div className="text-2xl font-bold text-white">{total}</div>
          <div className="text-xs text-gray-300">Capacity</div>
        </div>
      </div>

      {Array.isArray(features) && features.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium text-gray-300 mb-2">Facilities:</div>
          <div className="flex flex-wrap gap-2">
            {features.map((feature, index) => (
              <span
                key={index}
                className="text-xs bg-white/10 text-gray-200 px-2 py-1 rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      {price && (
        <div className="mt-4 mb-4 text-center">
          <span className="text-2xl font-bold text-white">{price}</span>
          <span className="text-gray-300 text-sm ml-1">per slot</span>
        </div>
      )}

      <button
        onClick={onView}
        className="group mt-6 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-emerald-500
                   hover:from-sky-400 hover:to-emerald-400 text-white py-2.5 rounded-xl font-medium"
      >
        <Car size={18} />
        View Spots
        <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
};

const ParkingZone = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
          // Prefer live aggregation fields from your controller:
          // totalSpots, availableSpotsLive, occupiedSpots, reservedSpots
          let total = numOrNull(z.totalSpots);
          if (total === null) total = numOrNull(z.capacity) ?? 0;

          let available = numOrNull(z.availableSpotsLive);
          if (available === null) available = numOrNull(z.availableSpots); // legacy snapshot

          let occupied = numOrNull(z.occupiedSpots);
          let reserved = numOrNull(z.reservedSpots);

          // Derive any missing numbers safely
          if (reserved === null && total !== null && available !== null && occupied !== null) {
            reserved = Math.max(0, total - available - occupied);
          }
          if (occupied === null && total !== null && available !== null && reserved !== null) {
            occupied = Math.max(0, total - available - reserved);
          }
          if (available === null && total !== null && occupied !== null && reserved !== null) {
            available = Math.max(0, total - occupied - reserved);
          }

          // Final clamps & fallbacks
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
            // keep occupied if you need it elsewhere:
            _occupied: occupied ?? Math.max(0, total - available - reserved),
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
    return <div className="min-h-screen bg-slate-950 text-white p-8">Loading…</div>;
  if (error)
    return <div className="min-h-screen bg-slate-950 text-red-300 p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(59,130,246,0.15),transparent),radial-gradient(1200px_600px_at_90%_10%,rgba(16,185,129,0.12),transparent)] bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <header className="mb-6">
          <h1 className="text-white text-3xl md:text-4xl font-bold">Parking Zones</h1>
          <p className="text-white/70 text-sm md:text-base mt-1">
            Real-time parking availability and reservation system
          </p>
        </header>

        <div className="text-center mt-2 text-white text-2xl font-semibold">
          Choose Your Location
        </div>
        <div className="text-center mt-1 text-gray-300 text-sm md:text-base font-medium">
          Select a parking area to view available spots in real-time
        </div>

        <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="text-center text-gray-300 mt-6">No zones found</div>
        )}
      </div>
    </div>
  );
};

export default ParkingZone;
