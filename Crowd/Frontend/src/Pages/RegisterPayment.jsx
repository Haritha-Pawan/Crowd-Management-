// src/pages/register/RegisterPayment.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api/checkout";
const nicRegex = /^(?:\d{12}|\d{9}[VvXx])$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRegex = /^0\d{9}$/;

/* ---------- Pricing ---------- */
const PRICING = {
  individual: 100,
  familyPerPerson: 100,
};

/* ---------- Helpers ---------- */
const digitsOnly = (s) => s.replace(/\D+/g, "");

// keep brand for icon row; force cvcLen=3
function detectBrand() {
  return { brand: "card", cvcLen: 3 };
}

// ---- Expiry helpers ----
function parseExpiry(exp) {
  const s = exp.replace(/[^\d]/g, "").slice(0, 4);
  return { mm: s.slice(0, 2), yy: s.slice(2, 4) };
}
function formatExpiryForTyping(v) {
  const s = digitsOnly(v).slice(0, 4);
  if (s.length <= 2) return s; // "1", "12"
  return `${s.slice(0, 2)}/${s.slice(2)}`; // "12/3", "12/34"
}
function isPastExpiry(mm, yy) {
  if (!(mm && yy) || mm.length !== 2 || yy.length !== 2) return false;
  const m = Number(mm);
  if (m < 1 || m > 12) return true;
  const now = new Date();
  const currYY = Number(String(now.getFullYear()).slice(2));
  const currMM = now.getMonth() + 1;
  return Number(yy) < currYY || (Number(yy) === currYY && m < currMM);
}

// Card number: strictly 16 digits, grouped
function formatCardNumber(v) {
  const s = digitsOnly(v).slice(0, 16);
  return s.replace(/(\d{1,4})/g, "$1 ").trim();
}

// Prevent non-digit key presses (allow nav keys/backspace/delete/tab)
function allowOnlyDigitsKeyDown(e) {
  const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
  if (allowed.includes(e.key)) return;
  if (!/^\d$/.test(e.key)) e.preventDefault();
}

/* --- Badges --- */
const BrandBadge = ({ brand }) => {
  const c = "h-6";
  if (brand === "visa") return (<svg viewBox="0 0 48 16" className={c}><rect width="48" height="16" rx="3" fill="#1A1F71" /><text x="8" y="11.5" fontSize="9" fill="#fff">VISA</text></svg>);
  if (brand === "mastercard") return (<svg viewBox="0 0 48 16" className={c}><rect width="48" height="16" rx="3" fill="#000" /><circle cx="20" cy="8" r="5" fill="#EB001B" /><circle cx="28" cy="8" r="5" fill="#F79E1B" /></svg>);
  if (brand === "amex") return (<svg viewBox="0 0 48 16" className={c}><rect width="48" height="16" rx="3" fill="#2E77BC" /><text x="4" y="11.5" fontSize="7" fill="#fff">AMERICAN</text><text x="4" y="15.5" fontSize="7" fill="#fff">EXPRESS</text></svg>);
  if (brand === "discover") return (<svg viewBox="0 0 48 16" className={c}><rect width="48" height="16" rx="3" fill="#F06000" /><text x="6" y="11.5" fontSize="8" fill="#fff">DISCOVER</text></svg>);
  return <div className="h-6 px-2 rounded bg-gray-200 text-gray-700 grid place-items-center text-xs">CARD</div>;
};
const AcceptedStrip = () => (
  <div className="flex items-center gap-2">
    <BrandBadge brand="visa" />
    <BrandBadge brand="mastercard" />
    <BrandBadge brand="amex" />
    <BrandBadge brand="discover" />
  </div>
);

export default function RegisterPayment() {
  const nav = useNavigate();
  const { state: personal } = useLocation();

  useEffect(() => { if (!personal) nav("/register"); }, [personal, nav]);

  /* ---------- Compute amount (locked) ---------- */
  const computedAmount = useMemo(() => {
    if (!personal) return 0;
    if (personal.type === "family") {
      const c = Math.max(2, parseInt(personal.count, 10) || 2);
      return c * PRICING.familyPerPerson;
    }
    return PRICING.individual;
  }, [personal]);

  /* ---------- State ---------- */
  const [payment, setPayment] = useState({ provider: "card", status: "pending", currency: "LKR", card: { brand: "", last4: "", expMonth: "", expYear: "" } });
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState(null);

  const [cardName, setCardName] = useState(personal?.fullName || "");
  const [cardNumber, setCardNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [saveCard, setSaveCard] = useState(true);
  const [cardTouched, setCardTouched] = useState(false);

  const [threeDSOpen, setThreeDSOpen] = useState(false);
  const [otp, setOtp] = useState("");

  const numberRef = useRef(null);
  const { brand, cvcLen } = useMemo(() => detectBrand(cardNumber), [cardNumber]);

  /* ---------- Validation ---------- */
  const errors = useMemo(() => {
    const e = {};
    if (!personal?.fullName?.trim()) e.fullName = "Required";
    if (!emailRegex.test(String(personal?.email || "").toLowerCase())) e.email = "Invalid email";
    if (!phoneRegex.test(String(personal?.phone || ""))) e.phone = "Use 07XXXXXXXX";
    if (!nicRegex.test(String(personal?.nic || "").toUpperCase())) e.nic = "Invalid NIC";
    if (!["individual", "family"].includes(personal?.type)) e.type = "Pick category";
    if (personal?.type === "family") {
      const c = parseInt(personal?.count, 10);
      if (!Number.isFinite(c) || c < 2) e.count = "Family count must be ≥ 2";
    }
    if (!(computedAmount > 0)) e.amount = "Amount not available";

    const rawNum = digitsOnly(cardNumber);
    if (!cardName.trim()) e.cardName = "Cardholder name required";
    if (rawNum.length !== 16) e.cardNumber = "Card number must be 16 digits"; // no Luhn now

    const { mm, yy } = parseExpiry(exp);
    const m = Number(mm);
    if (!(mm && yy && m >= 1 && m <= 12) || isPastExpiry(mm, yy)) e.exp = "Invalid expiry";

    if (!/^\d{3}$/.test(cvc)) e.cvc = `CVC must be ${cvcLen} digits`;
    return e;
  }, [personal, computedAmount, cardName, cardNumber, exp, cvc, cvcLen]);

  const back = () => nav("/register");

  /* ---------- API submit ---------- */
  const submitToAPI = async () => {
    setSubmitting(true);
    setServerError("");
    setResult(null);

    const { mm, yy } = parseExpiry(exp);
    const rawNum = digitsOnly(cardNumber);

    const payload = {
      nic: personal.nic.trim(),
      fullName: personal.fullName.trim(),
      email: personal.email.trim(),
      phone: personal.phone.trim(),
      type: personal.type,
      ...(personal.type === "family" ? { count: parseInt(personal.count, 10) } : {}),
      payment: {
        provider: "card",
        status: "paid",
        amount: computedAmount,
        currency: payment.currency || "LKR",
        card: { brand, last4: rawNum.slice(-4), expMonth: mm, expYear: `20${yy}` },
        saved: !!saveCard,
      },
    };

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data?.message || `Error ${res.status}`);
      } else {
        setResult(data);
        setOpen(true);
      }
    } catch (err) {
      setServerError(err.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- 3-D Secure flow (simulated) ---------- */
  const start3DS = async (e) => {
    e.preventDefault();
    setCardTouched(true);
    if (Object.keys(errors).length) return;
    setThreeDSOpen(true);
    setOtp("");
  };

  const confirm3DS = async () => {
    if (!/^\d{6}$/.test(otp)) return;
    setThreeDSOpen(false);
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1100));
    setSubmitting(false);
    setPayment((p) => ({ ...p, status: "paid" }));
    await submitToAPI();
  };

  /* ---------- Handlers ---------- */
  const onNumberChange = (v) => setCardNumber(formatCardNumber(v));
  const onExpChange = (v) => setExp(formatExpiryForTyping(v));
  const onExpBlur = () => {
    const { mm, yy } = parseExpiry(exp);
    if (mm.length !== 2 || yy.length !== 2) return;
    const now = new Date();
    const currYY = Number(String(now.getFullYear()).slice(2));
    const currMM = now.getMonth() + 1;
    const m = Math.min(12, Math.max(1, Number(mm) || 0));
    let fixed = `${String(m).padStart(2, "0")}/${yy}`;
    if (isPastExpiry(String(m).padStart(2, "0"), yy)) {
      fixed = `${String(currMM).padStart(2, "0")}/${String(currYY).padStart(2, "0")}`;
    }
    setExp(fixed);
  };
  const onCvcChange = (v) => setCvc(digitsOnly(v).slice(0, 3));

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen relative bg-transparent">
      {/* Background + overlay */}
      <img
        src="https://sridaladamaligawa.lk/wp-content/uploads/2020/09/Main-entrnce-Thumbnail-1-768x432.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-10"
      />
      <div className="absolute inset-0 bg-[#0B1120]/90" />

      {/* Top bar */}
      <header className="absolute top-0 inset-x-0 z-20">
        <nav className="max-w-7xl mx-auto h-14 px-5 flex items-center justify-between">
          <button onClick={back} className="text-[#E2E8F0] hover:text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition">
            ← Back
          </button>
        </nav>
      </header>

      {/* Transparent outer wrapper */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-5xl bg-transparent border-0 rounded-2xl p-0 text-[#E2E8F0]">
          {/* Title row */}
          <div className="mb-6 md:mb-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[22px] md:text-[24px] leading-[1.2] font-semibold">Complete Payment</h2>
                <p className="text-[13px] text-[#94A3B8] mt-1">Pay securely to receive your QR ticket</p>
              </div>
              <Stepper step={2} />
            </div>
          </div>

          {/* Order + Card form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Summary */}
            <section className="lg:col-span-1">
              <div className="rounded-xl border border-[#334155] bg-[#0b152c]/40 p-5">
                <h3 className="text-[16px] font-semibold">Order Summary</h3>
                <div className="mt-4 space-y-2 text-[13px]">
                  <Row label="Name" value={personal?.fullName || "-"} />
                  <Row label="NIC" value={personal?.nic || "-"} />
                  <Row
                    label="Type"
                    value={
                      personal?.type
                        ? personal.type + (personal.type === "family" ? ` (${personal.count})` : "")
                        : "-"
                    }
                  />
                  <Row label="Amount (LKR)" value={computedAmount.toLocaleString("en-LK")} />
                </div>

                <div className="mt-6 space-y-2 text-[11px] text-[#94A3B8]">
                  <p>Test card: <span className="font-medium text-[#E2E8F0]">4242 4242 4242 4242</span> (future expiry, any CVC).</p>
                  <p>3-D Secure demo will ask for a 6-digit code.</p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#334155] pt-4">
                  <span className="text-[13px] text-[#94A3B8]">Status</span>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      payment.status === "paid"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : payment.status === "pending"
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-rose-500/15 text-rose-300"
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
              </div>
            </section>

            {/* Payment form */}
            <section className="lg:col-span-2">
              <form onSubmit={start3DS} noValidate className="rounded-xl border border-[#334155] bg-[#0b152c]/40 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-semibold">Pay with card</h3>
                  <AcceptedStrip />
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <LabelWrap label="Cardholder name" error={cardTouched && errors.cardName}>
                    <input
                      className="u-input"
                      placeholder="Dinusha Lakmal"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      onBlur={() => setCardTouched(true)}
                    />
                  </LabelWrap>

                  <LabelWrap label="Card number" error={cardTouched && errors.cardNumber}>
                    <div className="relative">
                      <input
                        ref={numberRef}
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={19}              // 16 digits + 3 spaces
                        className="u-input pr-14"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => onNumberChange(e.target.value)}
                        onKeyDown={allowOnlyDigitsKeyDown}
                        onBlur={() => setCardTouched(true)}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <BrandBadge brand={brand} />
                      </div>
                    </div>
                  </LabelWrap>

                  <LabelWrap label="Expiry (MM/YY)" error={cardTouched && errors.exp}>
                    <input
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={5}
                      className="u-input"
                      placeholder="12/28"
                      value={exp}
                      onChange={(e) => onExpChange(e.target.value)}
                      onBlur={onExpBlur}
                      onKeyDown={allowOnlyDigitsKeyDown}
                    />
                  </LabelWrap>

                  <LabelWrap label="CVC" error={cardTouched && errors.cvc}>
                    <input
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={3}
                      className="u-input"
                      placeholder="123"
                      value={cvc}
                      onChange={(e) => onCvcChange(e.target.value)}
                      onKeyDown={allowOnlyDigitsKeyDown}
                      onBlur={() => setCardTouched(true)}
                    />
                  </LabelWrap>
                </div>

                <label className="mt-6 flex items-center gap-2 text-[13px] text-[#E2E8F0]">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border border-[#334155] bg-transparent"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                  />
                  Save card for faster checkout next time
                </label>

                {serverError && <div className="mt-4 text-[#FCA5A5] text-[13px]">{serverError}</div>}

                <div className="mt-6 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-7 py-2.5 text-[14px] font-semibold text-white shadow-lg hover:bg-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1] disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Processing…
                      </>
                    ) : (
                      <>Pay LKR {computedAmount.toLocaleString("en-LK")}</>
                    )}
                  </button>
                </div>
              </form>

              {/* Receipt */}
              {open && (
                <div className="mt-6 rounded-xl border border-[#334155] bg-[#0b152c]/40 p-5">
                  {result?.ticket ? (
                    <div className="grid md:grid-cols-2 gap-6 items-start">
                      <div>
                        <h4 className="text-[16px] font-semibold">Payment successful</h4>
                        <p className="text-[13px] text-[#94A3B8] mt-1">
                          Ticket issued for {result.ticket.fullName} — {result.ticket.type}
                          {result.ticket.type === "family" ? ` (${result.ticket.count})` : ""}
                        </p>
                        <p className="text-slate-600 text-sm mt-1">
                          Assigned counter:{" "}
                          <span className="font-semibold text-indigo-600">
                            {result?.ticket?.assignedCounterName || "Not assigned"}
                          </span>
                        </p>
                        <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 text-emerald-300 text-[13px]">
                          Status: Paid • {result.ticket?.payment?.card?.brand?.toUpperCase() || "CARD"} • **** {result.ticket?.payment?.card?.last4}
                        </div>
                      </div>
                      <div className="justify-self-end">
                        <img
                          alt="QR Code"
                          src={result.qr?.dataUrl || result.ticket?.qrDataUrl}
                          className="w-48 h-48 border border-[#334155] bg-[#0F172A]"
                          style={{ imageRendering: "pixelated" }}
                        />
                        <a
                          className="mt-3 inline-block rounded-xl bg-[#4F46E5] px-4 py-2 text-white hover:bg-[#6366F1]"
                          href={result.qr?.dataUrl || result.ticket?.qrDataUrl}
                          download={`ticket_${result.ticket.type}_${result.ticket.nic}.png`}
                        >
                          Download QR
                        </a>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-[16px] font-semibold">Something went wrong</h4>
                      <p className="text-[13px] text-[#94A3B8] mt-1">{serverError || "Please try again."}</p>
                    </>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <style>{`
        .u-label { font-size: 12px; line-height: 1.2; font-weight: 600; color: #E2E8F0; display: inline-block; }
        .u-err { font-size: 11px; color: #FCA5A5; margin-top: 6px; }
        .u-input {
          width: 100%; height: 44px; border-radius: 10px; border: 1px solid #334155;
          background: rgba(30, 41, 59, 0.6); color: #E2E8F0; padding: 0 14px; outline: none;
        }
        .u-input::placeholder { color: #94A3B8; }
        .u-input:focus { border-color: #818CF8; box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.18); }
      `}</style>

      {/* 3-D Secure modal */}
      {threeDSOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0F172A] border border-[#334155] p-6 shadow-2xl text-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <h4 className="text-[16px] font-semibold">3-D Secure Verification</h4>
              <button className="text-[#94A3B8] hover:text-white" onClick={() => setThreeDSOpen(false)} aria-label="Close">✕</button>
            </div>
            <p className="text-[13px] text-[#94A3B8] mt-2">
              We sent a one-time passcode to your phone. Enter the 6-digit code to authorize this payment.
            </p>
            <input
              inputMode="numeric"
              maxLength={6}
              className="mt-4 u-input text-center tracking-widest"
              placeholder="______"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D+/g, "").slice(0, 6))}
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="rounded-lg border border-[#334155] px-4 py-2 text-[#E2E8F0] hover:bg-white/10" onClick={() => setThreeDSOpen(false)}>
                Cancel
              </button>
              <button
                className="rounded-lg bg-[#4F46E5] px-4 py-2 text-white font-semibold hover:bg-[#6366F1] disabled:opacity-60"
                disabled={!/^\d{6}$/.test(otp)}
                onClick={confirm3DS}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Helpers */
function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-[13px] text-[#94A3B8]">{label}</span>
      <span className="text-[13px] text-[#E2E8F0]">{value}</span>
    </div>
  );
}
function LabelWrap({ label, error, children }) {
  return (
    <label className="block text-sm">
      <span className="u-label">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error ? <p className="u-err">{error}</p> : null}
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
