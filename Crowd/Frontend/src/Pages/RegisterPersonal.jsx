// src/pages/register/RegisterPersonal.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const nicRegex = /^(?:\d{12}|\d{9}[VvXx])$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRegex = /^0\d{9}$/;

export default function RegisterPersonal() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    nic: "",
    type: "individual",
    count: "",
    password: "",
    confirm: "",
  });

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const isFamily = form.type === "family";

  const errors = useMemo(() => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!emailRegex.test(form.email.trim().toLowerCase())) e.email = "Invalid email";
    if (!phoneRegex.test(form.phone.trim())) e.phone = "Use 07XXXXXXXX";
    if (!nicRegex.test(form.nic.trim().toUpperCase())) e.nic = "12 digits or 9 + V/X";
    if (isFamily) {
      const c = parseInt(form.count, 10);
      if (!Number.isFinite(c) || c < 2) e.count = "Family count must be ≥ 2";
    }
    if (form.password && form.password !== form.confirm) e.confirm = "Passwords do not match";
    return e;
  }, [form, isFamily]);

  const next = (e) => {
    e.preventDefault();
    if (Object.keys(errors).length) return;
    // 👉 send user to payment step and pass all form data
    nav("/register/payment", { state: form });
  };

  return (
    <div className="min-h-screen relative">
      {/* Background + overlay */}
      <img
        src="https://sridaladamaligawa.lk/wp-content/uploads/2020/09/Main-entrnce-Thumbnail-1-768x432.jpg"
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/55" />

      {/* Top bar */}
      <header className="absolute top-0 inset-x-0 z-20">
        <nav className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <Link
            to="/"
            className="text-white/90 hover:text-white px-3 py-2 rounded-md hover:bg-white/10 transition"
          >
            ← Home
          </Link>
          <div className="hidden sm:flex items-center gap-3 text-white/80 text-sm">
            <Link to="/login" className="hover:text-white underline underline-offset-4">
              Login
            </Link>
          </div>
        </nav>
      </header>

      {/* Card */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-6 py-16">
        <form
          onSubmit={next}
          noValidate
          className="w-full max-w-4xl bg-white/10 border border-white/15 rounded-2xl p-8 md:p-10 backdrop-blur-xl text-white shadow-[0_10px_35px_rgba(0,0,0,0.35)]"
        >
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-semibold">Personal details</h2>
              <p className="text-sm text-white/80">Step 1 of 2 — Fill in your personal information.</p>
            </div>
            <Stepper step={1} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Full name" error={errors.fullName}>
              <input className="field p-2" value={form.fullName} onChange={set("fullName")} placeholder="Dinusha Lakmal" />
            </Field>

            <Field label="Email" error={errors.email}>
              <input className="field" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
            </Field>

            <Field label="Phone" error={errors.phone}>
              <input className="field" type="tel" value={form.phone} onChange={set("phone")} placeholder="07XXXXXXXX" />
            </Field>

            <Field label="NIC Number" error={errors.nic}>
              <input className="field" value={form.nic} onChange={set("nic")} placeholder="200012345678 or 200012345V" />
            </Field>

            <Field label="Category">
              <select className="field" value={form.type} onChange={set("type")}>
                <option value="individual">Individual</option>
                <option value="family">Family</option>
              </select>
            </Field>

            {isFamily && (
              <Field label="Count (≥ 2)" error={errors.count}>
                <input className="field" type="number" min={2} value={form.count} onChange={set("count")} placeholder="2" />
              </Field>
            )}

            <Field label="Password">
              <input className="field" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" />
            </Field>

            <Field label="Confirm password" error={errors.confirm}>
              <input className="field" type="password" value={form.confirm} onChange={set("confirm")} placeholder="••••••••" />
            </Field>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <span className="text-sm text-white/70">Step 1 of 2</span>
            {/* keep as submit (no Link here) */}
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-3 text-white font-semibold shadow-lg hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Next →
            </button>
          </div>
        </form>
      </main>

      <style>{`
        .field {
          @apply w-full rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children, error }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-white">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <div className="text-rose-300 text-xs mt-1">{error}</div>}
    </label>
  );
}

function Stepper({ step = 1 }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2].map((s) => (
        <span
          key={s}
          className={`h-2.5 w-10 rounded-full ${s <= step ? "bg-white/90" : "bg-white/30"}`}
          aria-hidden
        />
      ))}
      <span className="sr-only">Step {step} of 2</span>
    </div>
  );
}
