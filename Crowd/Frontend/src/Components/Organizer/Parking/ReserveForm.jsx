import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  CreditCard,
  Calendar,
  User,
  MoveLeft,
  MapPin,
  CircleDollarSign,
  Clock3,
} from "lucide-react";

export default function ReserveForm() {
  const navigate = useNavigate();

  // demo spot (replace with real data if needed)
  const spot = {
    id: "A001",
    name: "Kandy",
    zone: "Zone A — Main Entrance",
    type: "Standard",
    ratePerHour: 300,
    distance: "100m",
  };

  // default date inline (no utils)
  const now = new Date();
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,"0")}-${String(
    now.getDate()
  ).padStart(2,"0")}`;

  const [form, setForm] = useState({
    date: todayISO,
    start: "09:00",
    end: "10:00",
    plate: "",
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");

  // derived values inline (no useMemo)
  const [sh, sm] = form.start.split(":").map(Number);
  const [eh, em] = form.end.split(":").map(Number);
  const minutes = eh * 60 + em - (sh * 60 + sm);
  const billableHours = minutes <= 0 ? 0 : Math.max(1, Math.ceil(minutes / 60));
  const total = billableHours * Number(spot.ratePerHour || 0);
  const humanDate =
    form.date && !Number.isNaN(new Date(form.date).getTime())
      ? new Date(form.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
      : "";
  const durationLabel =
    minutes <= 0
      ? "—"
      : `${Math.floor(minutes / 60) > 0 ? Math.floor(minutes / 60) + "h " : ""}${minutes % 60}m`;

  const handleSubmit = (e) => {
    e.preventDefault();

    // simple inline validation (no helpers)
    const eobj = {};
    if (!/^[A-Za-z]{2,3}-?\d{3,4}$/.test(form.plate.trim())) eobj.plate = "Use a format like ABC-1234";
    if (form.name.trim().length < 2) eobj.name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) eobj.email = "Enter a valid email";
    if (!/^\d{9,11}$/.test(form.phone.trim())) eobj.phone = "Enter 9–11 digit number";
    if (!form.date) eobj.date = "Pick a date";
    if (minutes <= 0) eobj.time = "End must be after start";
    setErrors(eobj);
    if (Object.keys(eobj).length > 0) return;

    // payload (frontend only)
    const payload = {
      spotId: spot.id,
      location: spot.name,
      zone: spot.zone,
      ratePerHour: spot.ratePerHour,
      date: form.date,
      start: form.start,
      end: form.end,
      minutes,
      billableHours,
      total,
      vehicle: { plate: form.plate },
      driver: { name: form.name, email: form.email, phone: form.phone },
      notes: form.notes,
    };
    console.log("Reservation (frontend only):", payload);
    setMsg("Reservation submitted! (frontend demo) ✅");
    setTimeout(() => navigate("/parking"), 900);
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
          <h1 className="text-white text-3xl md:text-4xl font-bold">Reserve a Spot</h1>
          <p className="text-white/70 mt-1">Same colors + glass UI. Frontend only.</p>
        </header>

        {msg && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/10 text-white px-4 py-3">
            {msg}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spot summary */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-sky-300" /> Spot Summary
            </h2>

            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Location</span>
                <span className="text-white/90">{spot.name}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Zone</span>
                <span className="text-white/90">{spot.zone}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Spot ID</span>
                <span className="text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/15 bg-white/5">
                  {spot.id}
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
                  <CircleDollarSign className="h-4 w-4" /> Rs {Number(spot.ratePerHour).toFixed(2)}
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
                <Calendar className="h-3.5 w-3.5" />
                <span>{humanDate || form.date}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
          >
            {/* Time */}
            <div className="flex items-center gap-2 text-white text-sm font-semibold mb-2">
              <Calendar className="h-4 w-4" />
              <span>Reservation Time</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">Date</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={`w-full rounded-xl border ${
                    errors.date ? "border-rose-400/60" : "border-white/10"
                  } bg-white/5 text-white/90 placeholder-white/40 outline-none px-3 py-2 focus:ring-2 ${
                    errors.date
                      ? "focus:ring-rose-400/40 focus:border-rose-400/60"
                      : "focus:ring-cyan-400/50 focus:border-cyan-400/40"
                  } transition`}
                />
                {errors.date && <p className="text-rose-300 text-xs mt-1">{errors.date}</p>}
              </label>

              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">Start</span>
                <input
                  type="time"
                  value={form.start}
                  onChange={(e) => setForm({ ...form, start: e.target.value })}
                  className={`w-full rounded-xl border ${
                    errors.time ? "border-rose-400/60" : "border-white/10"
                  } bg-white/5 text-white/90 placeholder-white/40 outline-none px-3 py-2 focus:ring-2 ${
                    errors.time
                      ? "focus:ring-rose-400/40 focus:border-rose-400/60"
                      : "focus:ring-cyan-400/50 focus:border-cyan-400/40"
                  } transition`}
                />
              </label>

              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">End</span>
                <input
                  type="time"
                  value={form.end}
                  onChange={(e) => setForm({ ...form, end: e.target.value })}
                  className={`w-full rounded-xl border ${
                    errors.time ? "border-rose-400/60" : "border-white/10"
                  } bg-white/5 text-white/90 placeholder-white/40 outline-none px-3 py-2 focus:ring-2 ${
                    errors.time
                      ? "focus:ring-rose-400/40 focus:border-rose-400/60"
                      : "focus:ring-cyan-400/50 focus:border-cyan-400/40"
                  } transition`}
                />
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
                  className={`w-full rounded-xl border ${
                    errors.plate ? "border-rose-400/60" : "border-white/10"
                  } bg-white/5 text-white/90 placeholder-white/40 outline-none px-3 py-2 focus:ring-2 ${
                    errors.plate
                      ? "focus:ring-rose-400/40 focus:border-rose-400/60"
                      : "focus:ring-cyan-400/50 focus:border-cyan-400/40"
                  } transition`}
                />
                {errors.plate && <p className="text-rose-300 text-xs mt-1">{errors.plate}</p>}
              </label>

              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">Type</span>
                <select
                  className="w-full rounded-xl border border-white/10 bg-white/5 text-white/90 outline-none px-3 py-2 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/40 transition"
                  defaultValue="Car"
                >
                  <option>Car</option>
                  <option>Bike</option>
                  <option>Van</option>
                  <option>EV</option>
                </select>
              </label>

              <label className="block">
                <span className="text-white/70 text-xs mb-1 block">Color</span>
                <input
                  type="text"
                  placeholder="Blue"
                  className="w-full rounded-xl border border-white/10 bg-white/5 text-white/90 outline-none px-3 py-2 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/40 transition"
                />
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
                  className={`w-full rounded-xl border ${
                    errors.name ? "border-rose-400/60" : "border-white/10"
                  } bg-white/5 text-white/90 outline-none px-3 py-2 focus:ring-2 ${
                    errors.name
                      ? "focus:ring-rose-400/40 focus:border-rose-400/60"
                      : "focus:ring-cyan-400/50 focus:border-cyan-400/40"
                  } transition`}
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
                  className={`w-full rounded-xl border ${
                    errors.email ? "border-rose-400/60" : "border-white/10"
                  } bg-white/5 text-white/90 outline-none px-3 py-2 focus:ring-2 ${
                    errors.email
                      ? "focus:ring-rose-400/40 focus:border-rose-400/60"
                      : "focus:ring-cyan-400/50 focus:border-cyan-400/40"
                  } transition`}
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
                  className={`w-full rounded-xl border ${
                    errors.phone ? "border-rose-400/60" : "border-white/10"
                  } bg-white/5 text-white/90 outline-none px-3 py-2 focus:ring-2 ${
                    errors.phone
                      ? "focus:ring-rose-400/40 focus:border-rose-400/60"
                      : "focus:ring-cyan-400/50 focus:border-cyan-400/40"
                  } transition`}
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
                  className="w-full rounded-xl border border-white/10 bg-white/5 text-white/90 placeholder-white/40 outline-none px-3 py-2 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/40 transition resize-y min-h-[90px]"
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
