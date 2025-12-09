// src/pages/Parking.jsx
import React, { useEffect, useMemo, useState, useId } from "react";
import axios from "axios";
import { Car, Map } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
const API = "https://crowd-management-api.onrender.com/api";


/* ---------- small UI helpers ---------- */
const badgeClasses = (status) =>
  status === "available"
    ? "text-emerald-300 border-emerald-400/25 bg-emerald-500/10"
    : "text-rose-300 border-rose-400/25 bg-rose-500/10";

const cardAccent = (status) =>
  status === "available"
    ? "hover:from-emerald-400/10 hover:to-sky-400/10"
    : "hover:from-rose-400/10 hover:to-fuchsia-400/10";

const firstWordInitial = (text) => {
  const words = (text || "").trim().split(/\s+/).filter(Boolean);
  return (words[0]?.[0] || "S").toUpperCase();
};

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

/* ---------- currency helpers ---------- */
const currencyToNumber = (raw) => {
  if (raw === null || raw === undefined) return null;
  const m = String(raw).match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
};
const numberToCurrency = (n) => `Rs:${Number(n).toFixed(2)}`;

/* ---------- Optional donut (kept UI parity) ---------- */
function ProgressDonut({ value = 70, subtitle = "Available", size = 220 }) {
  const colors = getColorsByValue(value);
  const gradId = useId();
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-white font-bold text-3xl leading-none">{value}%</span>
        <span className="text-slate-300 text-xs mt-1">{subtitle}</span>
      </div>
      <svg viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id={`progressGradient-${gradId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.progress} />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>
      <div
        className="pointer-events-none absolute inset-0 rounded-full blur-2xl"
        style={{ boxShadow: "0 0 40px rgba(56,189,248,0.18)" }}
      />
    </div>
  );
}

/* ---------- API helpers ---------- */
async function fetchAllSpots() {
  const res = await axios.get(`${API}/spots`);
  const raw = res?.data?.data ?? res?.data ?? [];
  return Array.isArray(raw) ? raw : [];
}
async function fetchSpotsByZone(zoneId) {
  const res = await axios.get(`${API}/spots`, { params: { zoneId } });
  const raw = res?.data?.data ?? res?.data ?? [];
  return Array.isArray(raw) ? raw : [];
}

export default function Parking() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Received from ParkingZone.jsx
  const { placeId, zone, zonePrice, zonePriceText } = location.state || {};

  // 🔹 Resolve to a single numeric base price from what was passed
  const basePriceNumber =
    currencyToNumber(zonePrice) ?? currencyToNumber(zonePriceText) ?? 0;
  const basePriceText = numberToCurrency(basePriceNumber);

  const [parkingData, setParkingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        const rawSpots = placeId ? await fetchSpotsByZone(placeId) : await fetchAllSpots();
        if (!mounted) return;

        // Prefer the zone name we passed; otherwise a generic label
        const zoneName = zone || (placeId ? "Selected Zone" : "All Zones");
        const capacity = rawSpots.length;

        // ✅ USE ONLY the price we got from ParkingZone for every spot
        const spots = rawSpots.map((s, i) => {
          const availableByBool =
            s.available !== undefined ? (s.available ? "available" : "occupied") : null;
          const status = availableByBool || s.status || "available";

          return {
            id: s._id ?? s.id ?? String(i),
            name: s.label || `Spot ${s.spotNumber ?? i + 1}`,
            status,
            zone: s.zoneName || zoneName,
            price: basePriceText,              // ← this is the displayed price
            distance: `${30 + i * 2}m`,
            type: s.type ?? "Standard",
            features: Array.isArray(s.facilities) ? s.facilities : [],
          };
        });

        setParkingData({
          place: {
            id: placeId || "all",
            name: zoneName,
            capacity,
            location: "",
            type: "Mixed",
            price: basePriceNumber,            // header “Base price”
            facilities: [],
            updatedAt: new Date().toISOString(),
          },
          spots,
        });
        setError("");
      } catch (err) {
        console.error("[Parking] fetch error:", err);
        setError(err?.response?.data?.error || err.message || "Failed to load parking data");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [placeId, zone, basePriceNumber, basePriceText]);

  const stats = useMemo(() => {
    if (!parkingData?.spots) return { capacity: 0, occupied: 0, available: 0 };
    const capacity = parkingData.place.capacity;
    const occupied = parkingData.spots.filter((s) => s.status !== "available").length;
    const available = capacity - occupied;
    return { capacity, occupied, available };
  }, [parkingData]);

  const spots = useMemo(() => parkingData?.spots ?? [], [parkingData]);

  const navigateToReserve = (spot) => {
    navigate("/reserve", {
      state: {
        spotId: spot.id,
        placeId,
        spotData: {
          name: spot.name,
          price: spot.price, // already formatted (same base price)
          type: spot.type,
          distance: spot.distance,
          zone: spot.zone,
        },
      },
    });
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-white p-8">Loading…</div>;
  if (error) return <div className="min-h-screen bg-slate-950 text-red-300 p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(59,130,246,0.18),transparent),radial-gradient(1000px_500px_at_90%_0%,rgba(16,185,129,0.14),transparent)] bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="text-white text-4xl font-bold">Smart Parking System</div>
        <div className="text-white/70 mt-1">
          Zone: <span className="text-white">{parkingData?.place?.name || "Loading..."}</span>
          {parkingData?.place && <> — Capacity: <span className="text-white">{stats.capacity}</span></>}
          {parkingData?.place?.updatedAt && (
            <span className="text-white/40"> — updated {timeAgo(parkingData.place.updatedAt)}</span>
          )}
          {basePriceNumber > 0 && (
            <span className="text-white/60"> — Base price {basePriceText}</span>
          )}
        </div>

        <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 mt-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="text-white/80 text-sm">Available Spots</div>
            <div className="flex items-end justify-between mt-2">
              <div className="text-emerald-400 text-4xl font-bold">{stats.available}</div>
              <Car size={48} className="text-emerald-400/80" />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="text-white/80 text-sm">Occupied Spots</div>
            <div className="flex items-end justify-between mt-2">
              <div className="text-rose-400 text-4xl font-bold">{stats.occupied}</div>
              <Car size={48} className="text-rose-400/80" />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="text-white/80 text-sm">Total Spots</div>
            <div className="flex items-end justify-between mt-2">
              <div className="text-sky-400 text-4xl font-bold">{stats.capacity}</div>
              <Car size={48} className="text-sky-400/80" />
            </div>
          </div>
        </div>

        <div className="mt-10">
          {spots.length > 0 ? (
            <div className="grid 2xl:grid-cols-4 xl:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-6">
              {spots.map((spot) => (
                <div
                  key={spot.id}
                  className={`rounded-2xl border border-white/10 ${cardAccent(spot.status)} bg-white/5 p-5 backdrop-blur-md transition-all hover:bg-gradient-to-b hover:scale-[1.02] cursor-pointer`}
                  onClick={() => navigateToReserve(spot)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/10 text-white">
                      {firstWordInitial(spot.name)}
                    </div>
                    <div className={`text-xs border rounded-full px-2 py-0.5 ${badgeClasses(spot.status)}`}>
                      {spot.status}
                    </div>
                  </div>

                  <div className="text-white text-lg font-semibold">{spot.name}</div>
                  <div className="text-white/60 mt-1 text-sm">{spot.zone}</div>

                  <div className="mt-4 flex items-start gap-4">
                    <div>
                      <div className="text-white/40 text-xs">Price</div>
                      <div className="text-white mt-1">{spot.price}</div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs">Distance</div>
                      <div className="text-white mt-1">{spot.distance}</div>
                    </div>
                  </div>

                  {spot.features?.length > 0 && (
                    <div className="mt-4">
                      <div className="text-white/40 text-xs mb-2">Features</div>
                      <div className="flex flex-wrap gap-1">
                        {spot.features.map((feature) => (
                          <div key={feature} className="text-white/60 text-xs px-2 py-1 rounded-md bg-white/5">
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/map?spot=${encodeURIComponent(spot.id)}`);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 text-white/90 py-2 hover:bg-white/15 transition"
                    >
                      <Map size={18} />
                      Navigate
                    </button>
                    {spot.status === "available" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToReserve(spot);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-medium py-2 transition"
                      >
                        Reserve
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white/70 py-2 cursor-not-allowed"
                      >
                        Occupied
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white/50">No spots available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
