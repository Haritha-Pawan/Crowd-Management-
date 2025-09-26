// src/pages/Parking.jsx
import React, { useEffect, useMemo, useState, useId } from "react";
import axios from "axios";
import { Car, Map } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const API = "http://localhost:5000/api";

// ---------- small UI helpers ----------
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
  const diffMin = Math.max(
    Math.floor((Date.now() - new Date(iso).getTime()) / 60000),
    0
  );
  if (diffMin < 1) return "Just now";
  if (diffMin === 1) return "1 min ago";
  return `${diffMin} min ago`;
};

function ProgressDonut({ value = 70, subtitle = "Available", size = 220 }) {
  const colors = getColorsByValue(value);
  const gradId = useId();
  const data = [
    { name: "Progress", value },
    { name: "Remaining", value: Math.max(0, 100 - value) },
  ];

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-white font-bold text-3xl leading-none">
          {value}%
        </span>
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

      {/* Simple donut with two arcs using divs for simplicity */}
      <div className="pointer-events-none absolute inset-0 rounded-full blur-2xl"
           style={{ boxShadow: "0 0 40px rgba(56,189,248,0.18)" }} />
    </div>
  );
}

// ---------- try both spots endpoints & normalize ----------
async function fetchSpotsForPlace(placeId, startISO, endISO) {
  const candidates = [`${API}/spots`, `${API}/parkingSpots`]; // old and new
  for (const url of candidates) {
    try {
      console.log("[Parking] GET spots:", url, { placeId, startISO, endISO });
      const res = await axios.get(url, {
        params: { placeId, start: startISO, end: endISO },
      });

      // normalize: array | {data:[]} | {spots:[]} | {items:[]}
      const raw =
        res?.data?.data ??
        res?.data?.spots ??
        res?.data?.items ??
        res?.data;

      if (Array.isArray(raw)) {
        console.log("[Parking] Spots found:", raw.length, "from", url);
        return raw;
      }
    } catch (e) {
      if (e?.response?.status === 404) {
        // try next candidate
        continue;
      }
      console.warn("[Parking] spots fetch error from", url, e);
    }
  }
  console.warn("[Parking] No spots endpoint returned a list. Using empty array.");
  return [];
}

// ---------- component ----------
export default function Parking() {
  const navigate = useNavigate();
  const location = useLocation();
  const { placeId } = location.state || {};

  const [parkingData, setParkingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch place + spots
  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!placeId) {
        setError("No place ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const now = new Date();
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        // 1) place
        console.log("[Parking] GET place:", `${API}/places/${placeId}`);
        const placeRes = await axios.get(`${API}/places/${placeId}`);
        const payload = placeRes?.data?.data ?? placeRes?.data ?? {};
        const place = Array.isArray(payload) ? payload[0] : payload;
        if (!place?._id) throw new Error("Invalid place payload");

        // 2) spots (try both endpoints)
        const rawSpots = await fetchSpotsForPlace(
          placeId,
          now.toISOString(),
          endOfDay.toISOString()
        );

        if (!mounted) return;

        // if none returned, synthesize from capacity
        const capacity = Number(place.capacity ?? 0);
        const spots =
          rawSpots.length === 0
            ? Array.from({ length: capacity }, (_, i) => ({
                _id: `temp-${i + 1}`,
                label: `${(place.code || place.name || "SPOT")
                  .toString()
                  .replace(/\s+/g, "-")
                  .toUpperCase()}-${String(i + 1).padStart(3, "0")}`,
                status: "available",
                available: true,
                type: place.type || "Standard",
                price: Number(place.price ?? 0),
                facilities: Array.isArray(place.facilities)
                  ? place.facilities
                  : [],
              }))
            : rawSpots;

        setParkingData({
          place: {
            id: place._id,
            name: place.name,
            capacity,
            location: place.location ?? "",
            type: place.type ?? "Standard",
            price: Number(place.price ?? 0),
            facilities: Array.isArray(place.facilities)
              ? place.facilities
              : [],
            updatedAt: place.updatedAt,
          },
          spots: spots.map((s) => ({
            id: s._id ?? s.id,
            label: s.label || `Spot ${s.spotNumber ?? "?"}`,
            status:
              s.status || (s.available === false ? "occupied" : "available"),
            available:
              s.available !== undefined
                ? Boolean(s.available)
                : s.status !== "occupied",
            type: s.type ?? place.type ?? "Standard",
            price: Number(s.price ?? place.price ?? 0),
            facilities: Array.isArray(s.facilities)
              ? s.facilities
              : Array.isArray(place.facilities)
              ? place.facilities
              : [],
          })),
        });
        setError("");
      } catch (err) {
        console.error("[Parking] fetch error:", err);
        setError(
          err?.response?.data?.error || err.message || "Failed to load parking data"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [placeId]);

  // stats
  const stats = useMemo(() => {
    if (!parkingData?.spots) return { capacity: 0, occupied: 0, available: 0 };
    const capacity = parkingData.place.capacity;
    const occupied = parkingData.spots.filter((s) => !s.available).length;
    const available = capacity - occupied;
    return { capacity, occupied, available };
  }, [parkingData]);

  // transformed for UI
  const spots = useMemo(() => {
    if (!parkingData?.spots) return [];
    return parkingData.spots.map((s, i) => ({
      id: s.id,
      name: s.label,
      status: s.available ? "available" : "occupied",
      zone: parkingData.place.name,
      price: `Rs:${s.price}`,
      distance: `${30 + i * 2}m`,
      type: s.type,
      features: s.facilities,
    }));
  }, [parkingData]);

  const handleNavigateToReserve = (spot) => {
    navigate("/reserve", {
      state: {
        spotId: spot.id,
        placeId,
        spotData: {
          name: spot.name,
          price: spot.price,
          type: spot.type,
          distance: spot.distance,
          zone: spot.zone,
        },
      },
    });
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">Loading…</div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-slate-950 text-red-300 p-8">{error}</div>
    );

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(59,130,246,0.18),transparent),radial-gradient(1000px_500px_at_90%_0%,rgba(16,185,129,0.14),transparent)] bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="text-white text-4xl font-bold">Smart Parking System</div>
        <div className="text-white/70 mt-1">
          Zone:{" "}
          <span className="text-white">
            {parkingData?.place?.name || "Loading..."}
          </span>
          {parkingData?.place && (
            <>
              {" "}
              — Capacity: <span className="text-white">{stats.capacity}</span>
            </>
          )}
          {parkingData?.place?.updatedAt && (
            <span className="text-white/40">
              {" "}
              — updated {timeAgo(parkingData.place.updatedAt)}
            </span>
          )}
        </div>

        <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 mt-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="text-white/80 text-sm">Available Spots</div>
            <div className="flex items-end justify-between mt-2">
              <div className="text-emerald-400 text-4xl font-bold">
                {stats.available}
              </div>
              <Car size={48} className="text-emerald-400/80" />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="text-white/80 text-sm">Occupied Spots</div>
            <div className="flex items-end justify-between mt-2">
              <div className="text-rose-400 text-4xl font-bold">
                {stats.occupied}
              </div>
              <Car size={48} className="text-rose-400/80" />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="text-white/80 text-sm">Total Spots</div>
            <div className="flex items-end justify-between mt-2">
              <div className="text-sky-400 text-4xl font-bold">
                {stats.capacity}
              </div>
              <Car size={48} className="text-sky-400/80" />
            </div>
          </div>
        </div>

        <div className="mt-10">
          {spots && spots.length > 0 ? (
            <div className="grid 2xl:grid-cols-4 xl:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-6">
              {spots.map((spot) => (
                <div
                  key={spot.id}
                  className={`rounded-2xl border border-white/10 ${cardAccent(
                    spot.status
                  )} bg-white/5 p-5 backdrop-blur-md transition-all hover:bg-gradient-to-b hover:scale-[1.02] cursor-pointer`}
                  onClick={() => handleNavigateToReserve(spot)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/10 text-white">
                      {firstWordInitial(spot.name)}
                    </div>
                    <div
                      className={`text-xs border rounded-full px-2 py-0.5 ${badgeClasses(
                        spot.status
                      )}`}
                    >
                      {spot.status}
                    </div>
                  </div>

                  <div className="text-white text-lg font-semibold">
                    {spot.name}
                  </div>
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
                          <div
                            key={feature}
                            className="text-white/60 text-xs px-2 py-1 rounded-md bg-white/5"
                          >
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
                          handleNavigateToReserve(spot);
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
            <div className="text-center text-white/50">
              {loading ? "Loading spots..." : "No spots available."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
