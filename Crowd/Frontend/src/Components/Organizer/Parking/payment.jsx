// src/pages/Checkout/Payment.jsx
import React, { useEffect, useMemo, useState } from "react";
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

/** ================== CONFIG ================== */
const PARKING_SPOTS_API = "http://${API_BASE_URL}/api/spots";
const RESERVATION_CONFIRM_API = "http://${API_BASE_URL}/api/reservations/confirm";
/** ============================================ */

// ---------- helpers ----------
const isObjectId = (v) => /^[0-9a-fA-F]{24}$/.test(String(v || ""));
const formatDateTime = (iso) => {
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
};
const minutesBetween = (a, b) => {
  const s = a ? new Date(a).getTime() : NaN;
  const e = b ? new Date(b).getTime() : NaN;
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return 0;
  return Math.round((e - s) / (60 * 1000));
};
const durationLabel = (mins) => {
  if (mins <= 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h ? `${h}h ` : ""}${m}m`;
};

// --- input sanitizers/validators ---
const sanitizePlate = (v) => v.toUpperCase().replace(/\s+/g, "");
const formatCardNumber = (v) => {
  const digits = String(v).replace(/\D/g, "").slice(0, 19); // support 13-19 digits
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
};
const rawCardDigits = (v) => String(v).replace(/\D/g, "");
const sanitizeCVC = (v) => String(v).replace(/\D/g, "").slice(0, 4);
const normalizeExpiryInput = (v) => {
  // allow "MMYY" -> "MM/YY", keep only digits and slash
  const digits = String(v).replace(/[^\d]/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};
const parseExpiry = (v) => {
  const m = String(v).match(/^(\d{2})\/(\d{2})$/);
  if (!m) return null;
  const mm = parseInt(m[1], 10);
  const yy = parseInt(m[2], 10);
  if (mm < 1 || mm > 12) return null;
  const year = 2000 + yy;
  // Use end of the month 23:59:59
  const expDate = new Date(year, mm, 0, 23, 59, 59, 999);
  return { month: mm, year, expDate };
};
const isExpiryInFuture = (expDate) => expDate.getTime() >= Date.now();

// Luhn check for card number
const luhn = (numStr) => {
  const s = rawCardDigits(numStr);
  if (s.length < 13 || s.length > 19) return false;
  let sum = 0;
  let dbl = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let n = parseInt(s[i], 10);
    if (dbl) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    dbl = !dbl;
  }
  return sum % 10 === 0;
};

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const state = location.state || {};

  // ---------- booking data (state or URL fallback) ----------
  const spotId = state.spotId || query.get("spotId") || "";
  const spotCode = state.name || query.get("name") || "";       // human label
  const placeId = state.placeId || query.get("placeId") || "";  // for resolving by label
  const zoneName = state.zone || query.get("zone") || "";
  const spotType = state.type || query.get("type") || "Car";

  const startISO = state.startISO || query.get("startISO") || "";
  const endISO = state.endISO || query.get("endISO") || "";

  const pricePerHour = parseFloat(state.price || query.get("price") || "300") || 0;
  const mins = minutesBetween(startISO, endISO);
  const billableHours = mins <= 0 ? 0 : Math.max(1, Math.ceil(mins / 60));
  const total = billableHours * pricePerHour;

  // ---------- form/ui ----------
  const [driver, setDriver] = useState(state.driver || query.get("driver") || "");
  const [plate, setPlate] = useState(state.plate || query.get("plate") || "");
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvc: "" });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState("");

  const onCardChange = (e) => {
    const { name, value } = e.target;
    if (name === "number") {
      setCard((p) => ({ ...p, number: formatCardNumber(value) }));
    } else if (name === "expiry") {
      setCard((p) => ({ ...p, expiry: normalizeExpiryInput(value) }));
    } else if (name === "cvc") {
      setCard((p) => ({ ...p, cvc: sanitizeCVC(value) }));
    } else {
      setCard((p) => ({ ...p, [name]: value }));
    }
  };
  const markTouched = (field) => setTouched((t) => ({ ...t, [field]: true }));

  // ----- validation rules -----
  const validators = {
    general: () => {
      if (!zoneName || (!spotId && !spotCode)) return "Missing booking info. Please start again.";
      if (!(pricePerHour > 0)) return "Invalid rate for this spot.";
      if (!(total > 0)) return "Invalid total amount.";
      return "";
    },
    driver: (v) => {
      const s = (v || "").trim();
      if (s.length < 2) return "Driver name is required.";
      return "";
    },
    plate: (v) => {
      const s = sanitizePlate(v);
      if (!s) return "Plate number is required.";
      if (!/^[A-Z]{2,3}-?\d{3,4}$/.test(s)) return "Use a format like ABC-1234";
      return "";
    },
    time: () => {
      const now = Date.now() - 60 * 1000; // 1-min grace
      const s = startISO ? new Date(startISO).getTime() : NaN;
      const e = endISO ? new Date(endISO).getTime() : NaN;
      if (!Number.isFinite(s) || !Number.isFinite(e)) return "Please pick a valid time window.";
      if (s < now) return "Start must be in the future.";
      if (e <= s) return "End must be after start.";
      return "";
    },
    cardName: (v) => {
      const s = (v || "").trim();
      if (s.length < 2) return "Cardholder name is required.";
      return "";
    },
    cardNumber: (v) => {
      const digits = rawCardDigits(v);
      if (!digits) return "Card number is required.";
      if (!luhn(digits)) return "Invalid card number.";
      return "";
    },
    cardExpiry: (v) => {
      const norm = normalizeExpiryInput(v);
      const parsed = parseExpiry(norm);
      if (!parsed) return "Use MM/YY.";
      if (!isExpiryInFuture(parsed.expDate)) return "Card expired.";
      return "";
    },
    cardCvc: (v) => {
      const s = sanitizeCVC(v);
      if (!(s.length === 3 || s.length === 4)) return "3–4 digits.";
      return "";
    },
  };

  const computeErrors = () => {
    const e = {};
    const g = validators.general(); if (g) e.general = g;
    const d = validators.driver(driver); if (d) e.driver = d;
    const p = validators.plate(plate); if (p) e.plate = p;
    const t = validators.time(); if (t) e.time = t;
    const cn = validators.cardName(card.name); if (cn) e.cardName = cn;
    const cnum = validators.cardNumber(card.number); if (cnum) e.cardNumber = cnum;
    const cexp = validators.cardExpiry(card.expiry); if (cexp) e.cardExpiry = cexp;
    const ccvc = validators.cardCvc(card.cvc); if (ccvc) e.cardCvc = ccvc;
    return e;
  };

  const isFormValid = useMemo(() => Object.keys(computeErrors()).length === 0, [driver, plate, card, startISO, endISO, pricePerHour, total]);

  useEffect(() => {
    setErrors(computeErrors());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, plate, card, startISO, endISO, pricePerHour, total]);

  // Resolve _id from label if needed
  async function resolveSpotIdFromLabel(label, placeId, startISO, endISO) {
    try {
      const res = await axios.get(PARKING_SPOTS_API, {
        params: { placeId, start: startISO, end: endISO },
      });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      const exact = list.find(
        (s) => String(s.label || s.name).trim().toLowerCase() === String(label).trim().toLowerCase()
      );
      return exact ? exact._id : null;
    } catch {
      return null;
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setTouched({ driver: true, plate: true, cardName: true, cardNumber: true, cardExpiry: true, cardCvc: true, time: true });

    const latest = computeErrors();
    setErrors(latest);
    if (Object.keys(latest).length > 0) return;

    try {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 500)); // simulate gateway

      // Ensure we have a Mongo _id
      let idToUse = spotId;
      if (!isObjectId(idToUse)) {
        if (!placeId) throw new Error("Missing placeId to resolve the spot by label.");
        idToUse = await resolveSpotIdFromLabel(spotCode, placeId, startISO, endISO);
      }
      if (!isObjectId(idToUse)) {
        throw new Error(`Spot not found for label "${spotCode}". Check your database labels.`);
      }

      const paymentId = "pm_" + Math.random().toString(36).slice(2, 11);

      const payload = {
        spotId: idToUse,
        startISO,
        endISO,
        amount: Number(total),
        currency: "LKR",
        paymentId,
        paymentMethod: "mock",
        driverName: driver.trim(),
        plate: sanitizePlate(plate),
        vehicleType: spotType || "Car",
      };

      const reservationRes = await axios.post(RESERVATION_CONFIRM_API, payload);
      const created = reservationRes?.data?.data;

      if (created?._id) {
        setMessage("Success! Your spot has been reserved.");
        const zoneFromUrl = query.get("zoneId") || "";
        setTimeout(() => {
          navigate(`/parking?zoneId=${encodeURIComponent(zoneFromUrl)}`, {
            replace: true,
            state: { success: true, message: "Parking spot reserved successfully!" },
          });
        }, 1200);
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (err) {
      console.error("Payment/Reservation error:", err);
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error;
      const msg = serverMsg || err?.message || "Failed to process payment and reserve the spot.";
      setErrors((p) => ({ ...p, general: msg }));
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

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
                  <span className="text-white/90">{sanitizePlate(plate)}</span>
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
                  {spotType || "Car"}
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

          {/* Payment Form */}
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
                  onBlur={() => markTouched("driver")}
                  placeholder="J. Perera"
                  className={`w-full rounded-xl border ${touched.driver && errors.driver ? "border-rose-400/60" : "border-white/10"} bg-white/5 text-white/90 px-3 py-2 outline-none`}
                  aria-invalid={!!(touched.driver && errors.driver)}
                />
                {touched.driver && errors.driver && <p className="text-rose-300 text-xs mt-1">{errors.driver}</p>}
              </label>

              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">Plate Number</span>
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(sanitizePlate(e.target.value))}
                  onBlur={() => markTouched("plate")}
                  placeholder="ABC-1234"
                  className={`w-full rounded-xl border ${touched.plate && errors.plate ? "border-rose-400/60" : "border-white/10"} bg-white/5 text-white/90 px-3 py-2 outline-none`}
                  aria-invalid={!!(touched.plate && errors.plate)}
                />
                {touched.plate && errors.plate && <p className="text-rose-300 text-xs mt-1">{errors.plate}</p>}
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
                  onBlur={() => markTouched("cardName")}
                  className={`w-full rounded-xl border ${touched.cardName && errors.cardName ? "border-rose-400/60" : "border-white/10"} bg-white/5 text-white/90 px-3 py-2 outline-none`}
                  aria-invalid={!!(touched.cardName && errors.cardName)}
                />
                {touched.cardName && errors.cardName && <p className="text-rose-300 text-xs mt-1">{errors.cardName}</p>}
              </label>

              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">Card Number</span>
                <input
                  name="number"
                  type="text"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  value={card.number}
                  onChange={onCardChange}
                  onBlur={() => markTouched("cardNumber")}
                  className={`w-full rounded-xl border ${touched.cardNumber && errors.cardNumber ? "border-rose-400/60" : "border-white/10"} bg-white/5 text-white/90 px-3 py-2 outline-none`}
                  aria-invalid={!!(touched.cardNumber && errors.cardNumber)}
                />
                {touched.cardNumber && errors.cardNumber && <p className="text-rose-300 text-xs mt-1">{errors.cardNumber}</p>}
              </label>

              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">Expiry (MM/YY)</span>
                <input
                  name="expiry"
                  type="text"
                  inputMode="numeric"
                  placeholder="08/27"
                  value={card.expiry}
                  onChange={onCardChange}
                  onBlur={() => markTouched("cardExpiry")}
                  className={`w-full rounded-xl border ${touched.cardExpiry && errors.cardExpiry ? "border-rose-400/60" : "border-white/10"} bg-white/5 text-white/90 px-3 py-2 outline-none`}
                  aria-invalid={!!(touched.cardExpiry && errors.cardExpiry)}
                />
                {touched.cardExpiry && errors.cardExpiry && <p className="text-rose-300 text-xs mt-1">{errors.cardExpiry}</p>}
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
                  onBlur={() => markTouched("cardCvc")}
                  className={`w-full rounded-xl border ${touched.cardCvc && errors.cardCvc ? "border-rose-400/60" : "border-white/10"} bg-white/5 text-white/90 px-3 py-2 outline-none`}
                  aria-invalid={!!(touched.cardCvc && errors.cardCvc)}
                />
                {touched.cardCvc && errors.cardCvc && <p className="text-rose-300 text-xs mt-1">{errors.cardCvc}</p>}
              </label>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className={`flex-1 inline-flex items-center justify-center gap-2 text-white py-2.5 rounded-xl font-medium ring-1 ring-white/10 ${
                  loading || !isFormValid
                    ? "bg-white/10 cursor-not-allowed"
                    : "bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400"
                }`}
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
              Demo only — after submit we call <b>/api/reservations/confirm</b>. Server flips the spot to <b>occupied</b>.
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
