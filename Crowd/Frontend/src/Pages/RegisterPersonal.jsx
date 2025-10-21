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
    type: "",
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
    if (!form.fullName.trim());
    if (!emailRegex.test(form.email.trim().toLowerCase())) e.email = "Invalid email";
    if (!phoneRegex.test(form.phone.trim())) e.phone = "Use 07XXXXXXXX";
    if (!nicRegex.test(form.nic.trim().toUpperCase())) e.nic = "Invalid NIC number";
    if (isFamily) {
      const c = parseInt(form.count, 10);
      if (!Number.isFinite(c) || c < 2) e.count = "Family count must be more than 2";
    }
    if (form.password && form.password !== form.confirm) e.confirm = "Passwords do not match";
    return e;
  }, [form, isFamily]);

  const next = (e) => {
    e.preventDefault();
    if (Object.keys(errors).length) return;
    nav("/register/payment", { state: form });
  };

  return (
    <div className="min-h-screen relative bg-[#0B1120]">
      {/* Background + overlay (subtle like the photo) */}
      <img
        src="https://sridaladamaligawa.lk/wp-content/uploads/2020/09/Main-entrnce-Thumbnail-1-768x432.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-10"
      />
      <div className="absolute inset-0 bg-[#0B1120]/90" />

      {/* Top bar */}
      <header className="absolute top-0 inset-x-0 z-20">
        <nav className="max-w-7xl mx-auto h-14 px-5 flex items-center justify-between">
          <Link
            to="/"
            className="text-[#E2E8F0] hover:text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition"
          >
            ← Home
          </Link>
          <div className="hidden sm:flex items-center gap-3 text-[#CBD5E1] text-[13px]">
            <Link to="/login" className="hover:text-white underline underline-offset-4">
              Login
            </Link>
          </div>
        </nav>
      </header>

      {/* Centered dark modal-style card (exact vibe) */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-24">
        <form
          onSubmit={next}
          noValidate
          className="w-full max-w-4xl bg-[#0F172A] border border-[#334155] rounded-2xl p-6 md:p-8 text-[#E2E8F0] shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
        >
          {/* Title + subtitle + stepper (sizes/colors like screenshot) */}
          <div className="mb-6 md:mb-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[22px] md:text-[24px] leading-[1.2] font-semibold">
                  Add Personal Details
                </h2>
                <p className="text-[13px] text-[#94A3B8] mt-1">
                  Create your visitor profile for the event
                </p>
              </div>
              <Stepper step={1} />
            </div>
          </div>

          {/* Two-column compact grid like the photo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {/* Row 1 */}
            <Field label="Full Name" required error={errors.fullName}>
              <input
                className="u-input"
                value={form.fullName}
                onChange={set("fullName")}
                placeholder=""
                aria-invalid={!!errors.fullName}
              />
            </Field>

            <Field label="Email" required error={errors.email}>
              <input
                className="u-input"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
              />
            </Field>

            {/* Row 2 */}
            <Field label="Phone" required error={errors.phone}>
              <input
                className="u-input"
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="07XXXXXXXX"
                aria-invalid={!!errors.phone}
              />
            </Field>

            <Field label="NIC Number" required error={errors.nic} >
              <input
                className="u-input"
                value={form.nic}
                onChange={set("nic")}
                placeholder=""
                aria-invalid={!!errors.nic}
              />
            </Field>

            {/* Row 3 */}
            <Field label="Category" required>
              <select
                className="u-input"
                value={form.type}
                onChange={set("type")}
                aria-label="Category"
              >
                <option value="individual">Individual</option>
                <option value="family">Family</option>
              </select>
            </Field>

            {isFamily ? (
              <Field label="Count" required error={errors.count} >
                <input
                  className="u-input"
                  type="number"
                  min={2}
                  value={form.count}
                  onChange={set("count")}
                  placeholder="2"
                  aria-invalid={!!errors.count}
                />
              </Field>
            ) : (
              <div className="hidden md:block" aria-hidden />
            )}

            {/* Row 4 */}
            <Field label="Password" required>
              <input
                className="u-input"
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder="••••••••"
              />
            </Field>

            <Field label="Confirm Password" required error={errors.confirm}>
              <input
                className="u-input"
                type="password"
                value={form.confirm}
                onChange={set("confirm")}
                placeholder="••••••••"
                aria-invalid={!!errors.confirm}
              />
            </Field>
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-between">
            <span className="text-[13px] text-[#94A3B8]">Step 1 of 2</span>
            <button
              type="submit"
              className="rounded-xl bg-[#4F46E5] px-7 py-2.5 text-[14px] font-semibold text-white shadow-lg hover:bg-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            >
              Next →
            </button>
          </div>
        </form>
      </main>

      {/* Exact-look utility styles (font sizes/colors/inputs like photo) */}
      <style>{`
        /* Label + hint + error to match screenshot scale/colors */
        .u-label {
          font-size: 12px;
          line-height: 1.2;
          font-weight: 600;
          color: #E2E8F0; /* slate-200-ish */
          display: inline-block;
        }
        .u-asterisk {
          color: #FCA5A5; /* soft red */
          margin-left: 2px;
        }
        .u-hint {
          font-size: 11px;
          color: #94A3B8; /* slate-400-ish */
          margin-top: 6px;
        }
        .u-err {
          font-size: 11px;
          color: #FCA5A5; /* soft red */
          margin-top: 6px;
        }

        /* Input look from the photo */
        .u-input {
          width: 100%;
          height: 44px;                /* compact but touch-friendly */
          border-radius: 10px;         /* rounded like screenshot */
          border: 1px solid #334155;   /* slate-600 border tone */
          background: rgba(30, 41, 59, 0.6); /* slate-800/60 */
          color: #E2E8F0;              /* slate-200 text */
          padding: 0 14px;
          outline: none;
        }
        .u-input::placeholder {
          color: #94A3B8;              /* slate-400 placeholder */
        }
        .u-input:focus {
          border-color: #818CF8;       /* indigo-400 */
          box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.18); /* soft focus ring */
        }

        textarea.u-input {
          height: auto;
          min-height: 96px;
          padding-top: 10px;
          padding-bottom: 10px;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children, error, required = false, hint }) {
  return (
    <label className="block">
      <span className="u-label">
        {label}
        {required && <span className="u-asterisk">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && !error && <div className="u-hint">{hint}</div>}
      {error && <div className="u-err">{error}</div>}
    </label>
  );
}

function Stepper({ step = 1 }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2].map((s) => (
        <span
          key={s}
          className={`h-2.5 w-10 rounded-full ${
            s <= step ? "bg-[#E2E8F0]" : "bg-[#475569]"
          }`}
          aria-hidden
        />
      ))}
      <span className="sr-only">Step {step} of 2</span>
    </div>
  );
}
