import React, { useMemo } from "react";
import { Car, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";

const badgeClasses = (status) =>
  status === "available"
    ? "text-emerald-300 border-emerald-400/25 bg-emerald-500/10"
    : "text-rose-300 border-rose-400/25 bg-rose-500/10";

const cardAccent = (status) =>
  status === "available"
    ? "hover:from-emerald-400/10 hover:to-sky-400/10"
    : "hover:from-rose-400/10 hover:to-fuchsia-400/10";

const Parking = () => {
  const navigate = useNavigate();

  const parkingDetails = [
    { id: 1, name: "Spot 1", status: "available", zone: "Zone A - Main Entrance", price: "Rs:300.00", distance: "50m",  type: "Standard", features: ["Covered"] },
    { id: 2, name: "Spot 2", status: "occupied",  zone: "Zone B - East Wing",     price: "Rs:250.00", distance: "100m", type: "Compact",  features: ["Valet"] },
    { id: 3, name: "Spot 3", status: "available", zone: "Zone C - South Wing",    price: "Rs:350.00", distance: "30m",  type: "Premium",  features: ["Covered"] },
    { id: 4, name: "Spot 4", status: "occupied",  zone: "Zone A - Main Entrance", price: "Rs:300.00", distance: "40m",  type: "Standard", features: ["Covered"] },
    { id: 5, name: "Spot 5", status: "available", zone: "Zone D - Rooftop",       price: "Rs:200.00", distance: "120m", type: "Compact",  features: ["Valet"] },
    { id: 6, name: "Spot 6", status: "occupied",  zone: "Zone E - Basement",      price: "Rs:280.00", distance: "70m",  type: "Standard", features: ["Covered"] },
    { id: 7, name: "Spot 7", status: "available", zone: "Zone F - Garden Side",   price: "Rs:400.00", distance: "20m",  type: "VIP",      features: ["Covered"] },
    { id: 8, name: "Spot 8", status: "available", zone: "Zone G - West Corner",   price: "Rs:220.00", distance: "90m",  type: "Standard", features: ["Valet"] },
  ];

  // Stats (auto-calculated)
  const { availableCount, occupiedCount, totalCount } = useMemo(() => {
    const availableCount = parkingDetails.filter(s => s.status === "available").length;
    const occupiedCount  = parkingDetails.filter(s => s.status === "occupied").length;
    return { availableCount, occupiedCount, totalCount: parkingDetails.length };
  }, [parkingDetails]);

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(59,130,246,0.18),transparent),radial-gradient(1000px_500px_at_90%_0%,rgba(16,185,129,0.14),transparent)] bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">

        {/* Header */}
        <div className="text-white text-4xl font-bold">Smart Parking System</div>
        <div className="text-white/70 mt-1">Real-time parking availability and reservation system</div>

        {/* KPI Cards */}
        <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 mt-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="text-white/80 text-sm">Available Spots</div>
            <div className="flex items-end justify-between mt-2">
              <div className="text-emerald-400 text-4xl font-bold">{availableCount}</div>
              <Car size={48} className="text-emerald-400/80" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="text-white/80 text-sm">Occupied Spots</div>
            <div className="flex items-end justify-between mt-2">
              <div className="text-rose-400 text-4xl font-bold">{occupiedCount}</div>
              <Car size={48} className="text-rose-400/80" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="text-white/80 text-sm">Total Spots</div>
            <div className="flex items-end justify-between mt-2">
              <div className="text-sky-400 text-4xl font-bold">{totalCount}</div>
              <Car size={48} className="text-sky-400/80" />
            </div>
          </div>
        </div>

        {/* Spots */}
        <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 mt-10">
          {parkingDetails.map((spot) => (
            <div
              key={spot.id}
              className={`rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-300
                          hover:shadow-xl bg-gradient-to-br ${cardAccent(spot.status)}`}
            >
              {/* Title + Status */}
              <div className="flex items-center justify-between">
                <div className="text-white font-semibold text-xl">{spot.name}</div>
                <div className={`px-2 py-1 text-xs rounded-full border ${badgeClasses(spot.status)}`}>
                  {spot.status}
                </div>
              </div>

              {/* Zone */}
              <div className="text-white/70 mt-1">{spot.zone}</div>

              {/* Details */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Price / Hour</span>
                  <span className="text-white font-semibold">{spot.price}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/60">Distance</span>
                  <span className="text-white font-semibold">{spot.distance}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/60">Type</span>
                  <span className="text-white font-semibold">{spot.type}</span>
                </div>

                {/* Features */}
                <div>
                  <div className="text-white/60 mb-2">Features</div>
                  <div className="flex flex-wrap gap-2">
                    {spot.features.map((feature, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full border border-white/10 bg-white/10 text-gray-200 text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => navigate(`/map?spot=${spot.id}`)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10
                             text-white/90 py-2 hover:bg-white/15 transition"
                >
                  <Map size={18} />
                  Navigate
                </button>

                {spot.status === "available" ? (
                  <button
                    onClick={() => navigate(`/reserve?spot=${spot.id}`)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl
                               bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400
                               text-white font-medium py-2 transition"
                  >
                    Reserve
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl
                               bg-gradient-to-r from-slate-600 to-slate-700 text-white/70 py-2 cursor-not-allowed"
                  >
                    Occupied
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Parking;
