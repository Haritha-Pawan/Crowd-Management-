import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Car, CreditCard, Calendar as CalendarIcon, User, MoveLeft,
  MapPin, CircleDollarSign, Clock3,
} from "lucide-react";

export default function ReserveForm() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1) Try to read from state first
  const stateSpotId = location.state?.spotId;
  const statePlaceId = location.state?.placeId;
  const stateSpotData = location.state?.spotData;

  // --- 2) Fallback: read from query if state is missing (works after refresh)
  const search = new URLSearchParams(location.search);
  const qsSpotId   = search.get("spotId")   || undefined;
  const qsPlaceId  = search.get("placeId")  || undefined;
  const qsName     = search.get("name")     || undefined;
  const qsZone     = search.get("zone")     || undefined;
  const qsType     = search.get("type")     || undefined;
  const qsPrice    = search.get("price")    || undefined;   // numeric string
  const qsDistance = search.get("distance") || undefined;

  // --- 3) Normalized reservation input
  const spotId  = stateSpotId  ?? qsSpotId;
  const placeId = statePlaceId ?? qsPlaceId;

  // If we have state, prefer it; else build from query
  const spotData = stateSpotData ?? (
    (qsName || qsZone || qsType || qsPrice || qsDistance)
      ? {
          name: qsName,
          zone: qsZone,
          type: qsType ?? "Standard",
          price: qsPrice,         // numeric string expected
          distance: qsDistance,
        }
      : undefined
  );

  // Redirect (politely) if both sources are missing
  useEffect(() => {
    if (!spotId || !placeId || !spotData) {
      navigate("/parking", { replace: true });
    }
  }, [spotId, placeId, spotData, navigate]);

  // If redirecting, render nothing
  if (!spotId || !placeId || !spotData) return null;

  // Compose the spot object used by the UI
  const spot = {
    spotId,
    placeId,
    name: spotData.name,
    zone: spotData.zone,
    price: spotData.price,       // can be "250" or "Rs:250" etc
    distance: spotData.distance,
    type: spotData.type ?? "Standard",
    status: "available",
  };

  // --- pricing helpers
  const priceNumber = useMemo(() => {
    const raw = typeof spot.price === "number" ? String(spot.price) : String(spot.price || "");
    const m = raw.match(/[\d.]+/g);
    return m ? parseFloat(m.join("")) : 0;
  }, [spot.price]);

  const now = new Date();
  const [startAt, setStartAt] = useState(now);
  const [endAt, setEndAt] = useState(() => new Date(now.getTime() + 60 * 60 * 1000)); // +1h

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const minEndDate = startAt;
  const minutes = Math.max(0, Math.round((endAt - startAt) / (60 * 1000)));
  const billableHours = minutes <= 0 ? 0 : Math.max(1, Math.ceil(minutes / 60));
  const total = billableHours * priceNumber;
  const durationLabel =
    minutes <= 0 ? "—" : `${Math.floor(minutes / 60) > 0 ? Math.floor(minutes / 60) + "h " : ""}${minutes % 60}m`;

  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    plate: "",
    vehicleType: "Car",
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const eobj = {};

    if (!form.plate.trim() || !/^[A-Za-z]{2,3}-?\d{3,4}$/.test(form.plate.trim()))
      eobj.plate = "Use a format like ABC-1234";
    if (form.name.trim().length < 2) eobj.name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) eobj.email = "Enter a valid email";
    if (!/^\d{9,11}$/.test(form.phone.trim())) eobj.phone = "Enter 9–11 digit number";
    if (startAt < new Date()) eobj.time = "Start must be in the future";
    if (endAt <= startAt) eobj.time = "End must be after start";

    setErrors(eobj);
    if (Object.keys(eobj).length > 0) return;

    // Build the booking passed to /payment
    const booking = {
      spotId,
      name: spot.name,   // ParkingSpot label
      placeId,
      zone: spot.zone,
      type: spot.type,
      price: Number(priceNumber),
      startISO: startAt.toISOString(),
      endISO: endAt.toISOString(),
      plate: form.plate,
      billableHours,
      total,
    };

    // Also send a query so refresh on /payment persists data
    const qs = new URLSearchParams({
      spotId: booking.spotId,
      name: booking.name,
      placeId: booking.placeId,
      zone: booking.zone ?? "",
      type: booking.type ?? "",
      price: String(booking.price),
      startISO: booking.startISO,
      endISO: booking.endISO,
      plate: booking.plate,
      billableHours: String(booking.billableHours),
      total: String(booking.total),
    }).toString();

    navigate(`/payment?${qs}`, { state: booking, replace: true });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(59,130,246,0.15),transparent),radial-gradient(1200px_600px_at_90%_10%,rgba(16,185,129,0.12),transparent)] bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/90 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm"
        >
          <MoveLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </button>

        <header className="mt-6">
          <h1 className="text-white text-3xl md:text-4xl font-bold">Reserve a Spot</h1>
        </header>

        {msg && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/10 text-white px-4 py-3">
            {msg}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spot Summary */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-sky-300" /> Spot Summary
            </h2>

            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Location</span>
                <span className="text-white/90">{spot.name || spot.spotId}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Zone</span>
                <span className="text-white/90">{spot.zone || "Selected Zone"}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Spot ID</span>
                <span className="text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/15 bg-white/5">
                  {spot.spotId}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Type</span>
                <span className="text-emerald-400 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-400/20 bg-emerald-400/10">
                  {spot.type}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Rate per hour</span>
                <span className="text-green-400 font-semibold inline-flex items-center gap-1">
                  <CircleDollarSign className="h-4 w-4" /> Rs {priceNumber.toFixed(2)}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Distance</span>
                <span className="text-white/90">{spot.distance}</span>
              </li>
            </ul>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-1.5 text-xs text-white/80 px-2.5 py-1 rounded-full border border-white/10 bg-white/5">
                <Clock3 className="h-3.5 w-3.5" />
                <span>Billable: {billableHours || 0}h</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/80 px-2.5 py-1 rounded-full border border-white/10 bg-white/5">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>{startAt.toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
          >
            <div className="flex items-center gap-2 text-white text-sm font-semibold mb-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Reservation Time</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-start">
              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">Start</span>
                <div className="relative ">
                  <DatePicker
                    selected={startAt}
                    onChange={(d) => {
                      if (!d) return;
                      setStartAt(d);
                      if (endAt <= d) setEndAt(new Date(d.getTime() + 60 * 60 * 1000));
                    }}
                    showTimeSelect
                    timeIntervals={5}
                    minDate={new Date()}
                    minTime={isSameDay(startAt, now) ? now : new Date(0, 0, 0, 0, 0)}
                    maxTime={new Date(0, 0, 0, 23, 55)}
                    dateFormat="MMM d, yyyy h:mm aa"
                    className="w-full lg:w-82 sm:w-80 md:w-96 h-11 rounded-xl border border-white/10 bg-white/5 text-white/90 outline-none px-3 py-2.5 text-sm"
                    calendarClassName="!bg-slate-100 !border !border-white/10 !rounded-xl !shadow-xl"
                    popperClassName="!z-[9999]"
                    popperPlacement="bottom-start"
                    popperModifiers={[
                      {
                        name: "sameWidth",
                        enabled: true,
                        phase: "beforeWrite",
                        requires: ["computeStyles"],
                        fn: ({ state }) => {
                          state.styles.popper.width = `${state.rects.reference.width}px`;
                        },
                      },
                    ]}
                    weekDayClassName={() => "text-slate-400"}
                    dayClassName={() => "text-slate-200 hover:bg-white/10 hover:text-white rounded-md"}
                    timeClassName={() => "text-slate-800 hover:bg-white/10 hover:text-white rounded-md"}
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">End</span>
                <div className="relative">
                  <DatePicker
                    selected={endAt}
                    onChange={(d) => d && setEndAt(d)}
                    showTimeSelect
                    timeIntervals={5}
                    minDate={startAt}
                    minTime={isSameDay(endAt, startAt) ? startAt : new Date(0, 0, 0, 0, 0)}
                    maxTime={new Date(0, 0, 0, 23, 55)}
                    dateFormat="MMM d, yyyy h:mm aa"
                    className="w-full lg:w-82 sm:w-80 md:w-96  h-11 rounded-xl border border-white/10 bg-white/5 text-white/90 outline-none px-3 py-2.5 text-sm"
                    calendarClassName="!bg-slate-900 !border !border-white/10 !rounded-xl !shadow-xl"
                    popperClassName="!z-[9999]"
                    popperPlacement="bottom-start"
                    popperModifiers={[
                      {
                        name: "sameWidth",
                        enabled: true,
                        phase: "beforeWrite",
                        requires: ["computeStyles"],
                        fn: ({ state }) => {
                          state.styles.popper.width = `${state.rects.reference.width}px`;
                        },
                      },
                    ]}
                    weekDayClassName={() => "text-slate-400"}
                    dayClassName={() => "text-slate-200 hover:bg-white/10 hover:text-white rounded-md"}
                    timeClassName={() => "text-slate-800  hover:text-white rounded-md"}
                  />
                </div>
              </label>
            </div>

            {errors.time && <p className="text-rose-300 text-xs mt-1">{errors.time}</p>}

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-white/60 text-xs">Duration</div>
                <div className="text-white text-lg font-semibold">{durationLabel}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-white/60 text-xs">Billable Hours</div>
                <div className="text-white text-lg font-semibold">{billableHours || 0}h</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 ring-1 ring-indigo-300/20">
                <div className="text-white/60 text-xs">Total</div>
                <div className="text-white text-lg font-semibold">Rs {total.toFixed(2)}</div>
              </div>
            </div>

            {/* Vehicle */}
            <div className="flex items-center gap-2 text-white text-sm font-semibold mb-2 mt-8">
              <Car className="h-4 w-4" />
              <span>Vehicle</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">Plate Number</span>
                <input
                  type="text"
                  placeholder="ABC-1234"
                  value={form.plate}
                  onChange={(e) => setForm({ ...form, plate: e.target.value })}
                  className={`w-full rounded-xl border ${errors.plate ? "border-rose-400/60" : "border-white/10"} bg-white/5 text-white/90 outline-none px-3 py-2`}
                />
                {errors.plate && <p className="text-rose-300 text-xs mt-1">{errors.plate}</p>}
              </label>

              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">Type</span>
                <select
                  className="w-full rounded-xl border border-white/10 bg-white/5 text-white/90 outline-none px-3 py-2"
                  value={form.vehicleType}
                  onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                >
                  <option>Car</option>
                  <option>Bike</option>
                  <option>Van</option>
                  <option>EV</option>
                </select>
              </label>
            </div>

            {/* Driver */}
            <div className="flex items-center gap-2 text-white text-sm font-semibold mb-2 mt-8">
              <User className="h-4 w-4" />
              <span>Driver</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">Full Name</span>
                <input
                  type="text"
                  placeholder="Haritha Pawan"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full rounded-xl border ${errors.name ? "border-rose-400/60" : "border-white/10"} bg-white/5 text-white/90 outline-none px-3 py-2`}
                />
                {errors.name && <p className="text-rose-300 text-xs mt-1">{errors.name}</p>}
              </label>

              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">Email</span>
                <input
                  type="email"
                  placeholder="you@mail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full rounded-xl border ${errors.email ? "border-rose-400/60" : "border-white/10"} bg-white/5 text-white/90 outline-none px-3 py-2`}
                />
                {errors.email && <p className="text-rose-300 text-xs mt-1">{errors.email}</p>}
              </label>

              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">Phone</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0770589643"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={`w-full rounded-xl border ${errors.phone ? "border-rose-400/60" : "border-white/10"} bg-white/5 text-white/90 outline-none px-3 py-2`}
                />
                {errors.phone && <p className="text-rose-300 text-xs mt-1">{errors.phone}</p>}
              </label>
            </div>

            {/* Notes + CTA */}
            <div className="mt-4">
              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">Notes (optional)</span>
                <textarea
                  rows={3}
                  placeholder="Any special requests?"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 text-white/90 outline-none px-3 py-2"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white py-2.5 rounded-xl font-medium ring-1 ring-white/10"
              >
                <CreditCard className="h-5 w-5" /> Confirm Reservation
              </button>
              <button
                type="button"
                onClick={() => navigate("/parking")}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-white/90 hover:text-white hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
