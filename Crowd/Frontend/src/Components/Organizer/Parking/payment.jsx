
import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock3,
  Calendar as CalendarIcon,
  CircleDollarSign,
  Car,
  CreditCard,
  MoveLeft,
} from "lucide-react";

const PARKING_SPOTS_API = "http://localhost:5000/api/parkingSpots"; // uses models/ParkingSpot.js
const RESERVATIONS_API = "http://localhost:5000/api/reservations";

// ----------------- helpers -----------------
function isObjectId(value) {
  return /^[0-9a-fA-F]{24}$/.test(String(value || ""));
}
function formatDateTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}
function minutesBetween(startISO, endISO) {
  const s = startISO ? new Date(startISO).getTime() : NaN;
  const e = endISO ? new Date(endISO).getTime() : NaN;
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return 0;
  return Math.round((e - s) / (60 * 1000));
}
function durationLabel(mins) {
  if (mins <= 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h ? h + "h " : ""}${m}m`;
}
// -------------------------------------------

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const state = location.state || {};

  // Spot/booking info
  const spotId = state.spotId || query.get("spotId") || "";       // Mongo _id, if you have it
  const spotCode = state.name || query.get("name") || "";          // human label like "kalutara-001"
  const placeId = state.placeId || query.get("placeId") || "";     // required to resolve by label
  const zoneName = state.zone || query.get("zone") || "";
  const spotType = state.type || query.get("type") || "Standard";

  const startISO = state.startISO || query.get("startISO") || "";
  const endISO = state.endISO || query.get("endISO") || "";

  const pricePerHour = parseFloat(state.price || query.get("price") || "300") || 0;
  const mins = minutesBetween(startISO, endISO);
  const billableHours = mins <= 0 ? 0 : Math.max(1, Math.ceil(mins / 60));
  const total = billableHours * pricePerHour;

  // Form state
  const [driver, setDriver] = useState(state.driver || query.get("driver") || "");
  const [plate, setPlate] = useState(state.plate || query.get("plate") || "");
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvc: "" });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  function onCardChange(e) {
    setCard((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validate() {
    const e = {};
    if (!zoneName || (!spotId && !spotCode)) e.general = "Missing booking info. Please start again.";
    if (!driver.trim()) e.driver = "Driver name is required.";
    if (!plate.trim()) e.plate = "Plate number is required.";
    if (!startISO || !endISO || billableHours <= 0) e.time = "Please pick a valid time window.";

    // Card (UI only)
    if (!card.name.trim()) e.cardName = "Cardholder name is required.";
    const digits = card.number.replace(/\s+/g, "");
    if (!/^\d{16}$/.test(digits)) e.cardNumber = "Enter 16 digits (demo).";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) e.cardExpiry = "Use MM/YY.";
    if (!/^\d{3,4}$/.test(card.cvc)) e.cardCvc = "3–4 digits.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Resolve ParkingSpot _id from its label (case-insensitive) via /api/parkingSpots
  async function resolveSpotIdFromLabel(label, placeId, startISO, endISO) {
    try {
      const res = await axios.get(PARKING_SPOTS_API, {
        params: { placeId, start: startISO, end: endISO },
      });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      const exact = list.find(
        (s) => String(s.label).toLowerCase() === String(label).toLowerCase()
      );
      return exact ? exact._id : null;
    } catch {
      return null;
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMessage("");
    if (!validate()) return;

    try {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 500)); // simulate payment UX

      // Always use _id. If only label is available, resolve via /api/parkingSpots
      let idToUse = spotId;
      if (!isObjectId(idToUse)) {
        if (!placeId) throw new Error("Missing placeId to resolve the spot by label.");
        idToUse = await resolveSpotIdFromLabel(spotCode, placeId, startISO, endISO);
      }
      if (!isObjectId(idToUse)) {
        throw new Error(`Spot not found for label "${spotCode}". Check your database labels.`);
      }

      // 1) Process payment (simulated)
      const paymentId = "pm_" + Math.random().toString(36).substr(2, 9);

      // 2) Create reservation (server will flip spot → occupied atomically)
      const reservationData = {
        spotId: idToUse,
        startTime: startISO,
        endTime: endISO,
        priceCents: Math.round(total * 100),
        currency: "LKR",
        paymentId,
        paymentMethod: "mock",
        driverName: driver,
        plateNumber: plate,
      };

      const reservationRes = await axios.post(RESERVATIONS_API, reservationData);

      if (reservationRes.data?._id) {
        setMessage("Success! Your spot has been reserved.");
        const zoneFromUrl = query.get("zoneId") || "";
        setTimeout(() => {
          navigate(`/parking?zoneId=${encodeURIComponent(zoneFromUrl)}`, {
            replace: true,
            state: { success: true, message: "Parking spot reserved successfully!" },
          });
        }, 1500);
      }
    } catch (err) {
      console.error("Payment/Reservation error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to process payment and reserve the spot.";
      setErrors({ general: msg });
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(59,130,246,0.15),transparent),radial-gradient(1200px_600px_at_90%_10%,rgba(16,185,129,0.12),transparent)] bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/90 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm"
        >
          <MoveLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </button>

        <header className="mt-6">
          <h1 className="text-white text-3xl md:text-4xl font-bold">Checkout</h1>
          <p className="text-white/60 mt-1">Review your booking and enter details</p>
        </header>

        {message && (
          <div className="mt-4 rounded-lg border border-rose-400/30 bg-rose-500/10 text-rose-200 px-3 py-2 text-sm">
            {message}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Summary */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-sky-300" />
              Booking Summary
            </h2>

            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Zone</span>
                <span className="text-white/90">{zoneName || "—"}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Spot</span>
                <span className="text-white/90">{spotCode || "—"}</span>
              </li>

              {plate ? (
                <li className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Plate</span>
                  <span className="text-white/90">{plate}</span>
                </li>
              ) : null}
              {driver ? (
                <li className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Driver</span>
                  <span className="text-white/90">{driver}</span>
                </li>
              ) : null}
              <li className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Type</span>
                <span className="text-emerald-400 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-400/20 bg-emerald-400/10">
                  {spotType || "Standard"}
                </span>
              </li>
            </ul>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-white/60 text-xs mb-1 flex items-center gap-2">
                  <CalendarIcon className="h-3.5 w-3.5" /> Start
                </div>
                <div className="text-white font-medium">{formatDateTime(startISO)}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-white/60 text-xs mb-1 flex items-center gap-2">
                  <CalendarIcon className="h-3.5 w-3.5" /> End
                </div>
                <div className="text-white font-medium">{formatDateTime(endISO)}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-white/60 text-xs mb-1 flex items-center gap-2">
                  <Clock3 className="h-3.5 w-3.5" /> Duration
                </div>
                <div className="text-white font-medium">{durationLabel(mins)}</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-white/60 text-xs mb-1 flex items-center gap-2">
                  <CircleDollarSign className="h-3.5 w-3.5" /> Rate / hour
                </div>
                <div className="text-white font-semibold">Rs {pricePerHour.toFixed(2)}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 ring-1 ring-indigo-300/20">
                <div className="text-white/60 text-xs mb-1">Total</div>
                <div className="text-white text-xl font-semibold">Rs {total.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-sky-300" />
              Payment
            </h2>

            {errors.general && (
              <div className="mb-4 rounded-lg border border-rose-400/30 bg-rose-500/10 text-rose-200 px-3 py-2 text-sm">
                {errors.general}
              </div>
            )}
            {errors.time && (
              <div className="mb-4 rounded-lg border border-rose-400/30 bg-rose-500/10 text-rose-200 px-3 py-2 text-sm">
                {errors.time}
              </div>
            )}

            {/* Driver & Plate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">Driver Name</span>
                <input
                  type="text"
                  value={driver}
                  onChange={(e) => setDriver(e.target.value)}
                  placeholder="J. Perera"
                  className={`w-full rounded-xl border ${errors.driver ? "border-rose-400/60" : "border-white/10"} bg-white/5 text-white/90 px-3 py-2 outline-none`}
                />
                {errors.driver && <p className="text-rose-300 text-xs mt-1">{errors.driver}</p>}
              </label>

              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">Plate Number</span>
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  placeholder="ABC-1234"
                  className={`w-full rounded-xl border ${errors.plate ? "border-rose-400/60" : "border-white/10"} bg-white/5 text-white/90 px-3 py-2 outline-none`}
                />
                {errors.plate && <p className="text-rose-300 text-xs mt-1">{errors.plate}</p>}
              </label>
            </div>

            {/* Card (UI only) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">Cardholder Name</span>
                <input
                  name="name"
                  type="text"
                  placeholder="Cardholder"
                  value={card.name}
                  onChange={onCardChange}
                  className={`w-full rounded-xl border ${errors.cardName ? "border-rose-400/60" : "border-white/10"} bg-white/5 text-white/90 px-3 py-2 outline-none`}
                />
                {errors.cardName && <p className="text-rose-300 text-xs mt-1">{errors.cardName}</p>}
              </label>

              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">Card Number</span>
                <input
                  name="number"
                  type="text"
                  inputMode="numeric"
                  placeholder="4242424242424242"
                  value={card.number}
                  onChange={onCardChange}
                  className={`w-full rounded-xl border ${errors.cardNumber ? "border-rose-400/60" : "border-white/10"} bg-white/5 text-white/90 px-3 py-2 outline-none`}
                />
                {errors.cardNumber && <p className="text-rose-300 text-xs mt-1">{errors.cardNumber}</p>}
              </label>

              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">Expiry (MM/YY)</span>
                <input
                  name="expiry"
                  type="text"
                  placeholder="08/27"
                  value={card.expiry}
                  onChange={onCardChange}
                  className={`w-full rounded-xl border ${errors.cardExpiry ? "border-rose-400/60" : "border-white/10"} bg-white/5 text-white/90 px-3 py-2 outline-none`}
                />
                {errors.cardExpiry && <p className="text-rose-300 text-xs mt-1">{errors.cardExpiry}</p>}
              </label>

              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">CVC</span>
                <input
                  name="cvc"
                  type="password"
                  inputMode="numeric"
                  placeholder="123"
                  value={card.cvc}
                  onChange={onCardChange}
                  className={`w-full rounded-xl border ${errors.cardCvc ? "border-rose-400/60" : "border-white/10"} bg-white/5 text-white/90 px-3 py-2 outline-none`}
                />
                {errors.cardCvc && <p className="text-rose-300 text-xs mt-1">{errors.cardCvc}</p>}
              </label>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white py-2.5 rounded-xl font-medium ring-1 ring-white/10 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <CreditCard className="h-5 w-5" />
                {loading ? "Processing…" : `Pay Rs ${total.toFixed(2)}`}
              </button>

              <button
                type="button"
                onClick={() => navigate("/parking")}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-white/90 hover:text-white hover:bg-white/10"
              >
                Cancel
              </button>
            </div>

            <div className="mt-3 text-white/50 text-xs">
              Demo only — no real payment request. On submit, we create a reservation; the server flips the spot to <b>occupied</b>.
            </div>
          </form>
        </div>

        <div className="mt-8 flex items-center gap-2 text-white/50 text-xs text-center">
          <Car className="h-4 w-4" />
          <span>Smart Parking — secure &amp; simple checkout</span>
        </div>
      </div>
    </div>
  );
}
