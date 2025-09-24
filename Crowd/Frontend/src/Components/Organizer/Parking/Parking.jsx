import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Car, Map } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const API = "http://localhost:5000/api";

const badgeClasses = (status) =>
  status === "available"
    ? "text-emerald-300 border-emerald-400/25 bg-emerald-500/10"
    : "text-rose-300 border-rose-400/25 bg-rose-500/10";

const cardAccent = (status) =>
  status === "available"
    ? "hover:from-emerald-400/10 hover:to-sky-400/10"
    : "hover:from-rose-400/10 hover:to-fuchsia-400/10";

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const parsePositiveInt = (val, fallback = 0, max = 10000) => {
  const n = Number(val);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return clamp(Math.floor(n), 1, max);
};

// support BrowserRouter and HashRouter
const useQueryParams = () => {
  let search = "";
  if (typeof window !== "undefined") {
    if (window.location.search) search = window.location.search;
    else if (window.location.hash.includes("?"))
      search = "?" + window.location.hash.split("?")[1];
  }
  return new URLSearchParams(search || "");
};

const firstWordInitial = (text) => {
  const words = (text || "").trim().split(/\s+/).filter(Boolean);
  return (words[0]?.[0] || "S").toUpperCase();
};

const parseFeatures = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return String(raw).split(",").map((s) => s.trim()).filter(Boolean);
};

export default function Parking() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = useQueryParams();

  // Prefer state (from navigate), fallback to query
  const state = location.state ?? {};
  const zoneId = state.id ?? query.get("id") ?? "";
  const zoneNameRaw = (state.zone ?? query.get("zone") ?? "").trim();
  const zoneName = zoneNameRaw || "Unknown Zone";

  const capacityParam = parsePositiveInt(state.capacity ?? query.get("capacity"), 100, 2000);
  const occupiedParam = parsePositiveInt(state.occupied ?? query.get("occupied"), 0, capacityParam);

  const defaultPrice = state.price ?? query.get("price") ?? "300"; // numeric string is fine
  const defaultFeatures = parseFeatures(state.features ?? query.get("features")) || ["Covered"];

  const [zoneDoc, setZoneDoc] = useState(null);
  const [loading, setLoading] = useState(!!zoneId);
  const [error, setError] = useState("");

  // Try to load real zone (and spots) from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!zoneId) return;
      setLoading(true);
      try {
        const { data } = await axios.get(`${API}/zones/${zoneId}`);
        if (!mounted) return;
        setZoneDoc(data || null);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load zone");
        setZoneDoc(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [zoneId]);

  // capacity/occupied (prefer backend)
  const capacity = Number(zoneDoc?.capacity ?? capacityParam);
  const occupiedCount = clamp(Number(zoneDoc?.occupied ?? occupiedParam), 0, capacity);
  const availableCount = Math.max(capacity - occupiedCount, 0);

  // build spot list
  const spots = useMemo(() => {
    // Prefer backend spots if present
    if (Array.isArray(zoneDoc?.spots) && zoneDoc.spots.length > 0) {
      return zoneDoc.spots.map((s, i) => {
        const code = s.code || `${firstWordInitial(zoneNameRaw)}${String(i + 1).padStart(3, "0")}`;
        const status = (s.isAvailable === false || s.status === "occupied") ? "occupied" : "available";
        const features = Array.isArray(s.features) ? s.features : defaultFeatures;
        const price = s.pricePerHour ?? s.price ?? defaultPrice; // number or string
        return {
          id: code,      // <-- will be used as spotId
          name: code,    // label
          status,
          zone: zoneName,
          price,
          distance: `${30 + i * 2}m`,
          type: s.type || "Standard",
          features,
        };
      });
    }
    // fallback: synthesize
    const prefix = firstWordInitial(zoneNameRaw);
    return Array.from({ length: capacity }, (_, i) => {
      const index = i + 1;
      return {
        id: `${prefix}-${index}`,
        name: `${prefix}${String(index).padStart(3, "0")}`,
        status: index <= occupiedCount ? "occupied" : "available",
        zone: zoneName,
        price: defaultPrice,
        distance: `${30 + i * 2}m`,
        type: "Standard",
        features: defaultFeatures,
      };
    });
  }, [zoneDoc, zoneNameRaw, zoneName, capacity, occupiedCount, defaultPrice, defaultFeatures]);

  // ✅ Build a URL that matches ReserveForm's expected query keys
  const handleNavigateToReserve = (spot) => {
    const amount =
      typeof spot.price === "number"
        ? spot.price
        : Number(String(spot.price).replace(/[^\d.]/g, "")) || 0;

    const params = new URLSearchParams({
      spotId:   spot.id,               // what ReserveForm reads
      name:     spot.name,
      zone:     zoneName,
      price:    String(amount),
      distance: spot.distance || "",
      type:     spot.type || "Standard",
      status:   spot.status || "available",
    }).toString();

    navigate(`/reserve?${params}`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(59,130,246,0.18),transparent),radial-gradient(1000px_500px_at_90%_0%,rgba(16,185,129,0.14),transparent)] bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="text-white text-4xl font-bold">Smart Parking System</div>
        <div className="text-white/70 mt-1">
          Zone: <span className="text-white">{zoneName}</span> — Capacity:{" "}
          <span className="text-white">{capacity}</span>{" "}
          {loading && <span className="text-white/50">(loading…)</span>}
          {error && <span className="text-rose-300"> — {error}</span>}
        </div>

        <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 mt-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="text-white/80 text-sm">Available Spots</div>
            <div className="flex items/end justify-between mt-2">
              <div className="text-emerald-400 text-4xl font-bold">{availableCount}</div>
              <Car size={48} className="text-emerald-400/80" />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="text-white/80 text-sm">Occupied Spots</div>
            <div className="flex items/end justify-between mt-2">
              <div className="text-rose-400 text-4xl font-bold">{occupiedCount}</div>
              <Car size={48} className="text-rose-400/80" />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="text-white/80 text-sm">Total Spots</div>
            <div className="flex items/end justify-between mt-2">
              <div className="text-sky-400 text-4xl font-bold">{capacity}</div>
              <Car size={48} className="text-sky-400/80" />
            </div>
          </div>
        </div>

        {spots.length > 0 && (
          <div className="grid 2xl:grid-cols-4 xl:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-6 mt-10">
            {spots.map((spot, idx) => (
              <div
                key={spot.id || idx}
                className={`rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-300 hover:shadow-xl bg-gradient-to-br ${cardAccent(spot.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold text-xl">{spot.name}</div>
                  <div className={`px-2 py-1 text-xs rounded-full border ${badgeClasses(spot.status)}`}>
                    {spot.status}
                  </div>
                </div>

                <div className="text-white/70 mt-1">{spot.zone}</div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Price / Hour</span>
                    <span className="text-white font-semibold">
                      {String(spot.price).match(/^\d+(\.\d+)?$/) ? `Rs:${spot.price}` : spot.price}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Distance</span>
                    <span className="text-white font-semibold">{spot.distance}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Type</span>
                    <span className="text-white font-semibold">{spot.type}</span>
                  </div>
                  <div>
                    <div className="text-white/60 mb-2">Features</div>
                    <div className="flex flex-wrap gap-2">
                      {(spot.features || []).map((feature, i) => (
                        <span
                          key={`${spot.id}-f-${i}`}
                          className="px-3 py-1 rounded-full border border-white/10 bg-white/10 text-gray-200 text-xs"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/map?spot=${encodeURIComponent(spot.id)}`)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 text-white/90 py-2 hover:bg-white/15 transition"
                  >
                    <Map size={18} />
                    Navigate
                  </button>
                  {spot.status === "available" ? (
                    <button
                      onClick={() => handleNavigateToReserve(spot)}
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
        )}
      </div>
    </div>
  );
}
