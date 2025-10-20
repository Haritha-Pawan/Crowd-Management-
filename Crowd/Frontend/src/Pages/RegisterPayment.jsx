// src/pages/register/RegisterPayment.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API = "http://localhost:3001/api/checkout";
const nicRegex = /^(?:\d{12}|\d{9}[VvXx])$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRegex = /^0\d{9}$/;

/* ---------- Pricing (adjust as needed) ---------- */
const PRICING = {
  individual: 100,      // LKR per individual
  familyPerPerson: 100, // LKR per family member (min 2)
};

const digitsOnly = (s) => s.replace(/\D+/g, "");
const luhnCheck = (num) => {
  const arr = num.split("").reverse().map((n) => parseInt(n, 10));
  const sum = arr.reduce((acc, val, i) => {
    if (i % 2 === 1) {
      let dbl = val * 2;
      if (dbl > 9) dbl -= 9;
      return acc + dbl;
    }
    return acc + val;
  }, 0);
  return sum % 10 === 0;
};

function detectBrand(raw) {
  const s = digitsOnly(raw);
  if (/^4\d{12,18}$/.test(s)) return { brand: "visa", cvcLen: 3 };
  if (/^5[1-5]\d{14}$/.test(s) || /^2(2[2-9]|[3-6]\d|7[01])\d{12}$/.test(s)) return { brand: "mastercard", cvcLen: 3 };
  if (/^3[47]\d{13}$/.test(s)) return { brand: "amex", cvcLen: 4 };
  if (/^6(?:011|5)/.test(s)) return { brand: "discover", cvcLen: 3 };
  return { brand: "card", cvcLen: 3 };
}
function parseExpiry(exp) {
  const s = exp.replace(/[^\d]/g, "").slice(0, 4);
  return { mm: s.slice(0, 2), yy: s.slice(2, 4) };
}
function formatCardNumber(v, brand) {
  const s = digitsOnly(v).slice(0, 19);
  if (brand === "amex") {
    return s.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*$/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));
  }
  return s.replace(/(\d{1,4})/g, "$1 ").trim();
}
function formatExpiry(exp) {
  const { mm, yy } = parseExpiry(exp);
  return yy ? `${mm}/${yy}` : mm;
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

  useEffect(() => {
    if (!personal) nav("/register");
  }, [personal, nav]);

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
  const [payment, setPayment] = useState({
    provider: "card",
    status: "pending",
    currency: "LKR",
    card: { brand: "", last4: "", expMonth: "", expYear: "" },
  });

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
    if (rawNum.length < 12) e.cardNumber = "Card number too short";
    else if (!luhnCheck(rawNum)) e.cardNumber = "Invalid card number";
    const { mm, yy } = parseExpiry(exp);
    const mmNum = Number(mm);
    if (!(mm && yy && mmNum >= 1 && mmNum <= 12)) e.exp = "Invalid expiry";
    if (!/^\d{3,4}$/.test(cvc) || cvc.length !== cvcLen) e.cvc = `CVC must be ${cvcLen} digits`;
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
        amount: computedAmount,               // << locked amount
        currency: payment.currency || "LKR",
        card: {
          brand,
          last4: rawNum.slice(-4),
          expMonth: mm,
          expYear: `20${yy}`,
        },
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
  const onNumberChange = (v) => setCardNumber(formatCardNumber(v, brand));
  const onExpChange = (v) => setExp(formatExpiry(v));
  const onCvcChange = (v) => setCvc(digitsOnly(v).slice(0, cvcLen));

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Heading (no navbar) */}
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-4">
        <button onClick={back} className="text-sm text-slate-600 hover:text-slate-900">← Back</button>
      </div>

      <main className="max-w-6xl mx-auto px-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <section className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800">Order summary</h2>

              <div className="mt-4 space-y-2 text-sm">
                <Row label="Name" value={personal?.fullName || "-"} />
                <Row label="NIC" value={personal?.nic || "-"} />
                <Row
                  label="Type"
                  value={
                    personal?.type
                      ? personal?.type + (personal?.type === "family" ? ` (${personal?.count})` : "")
                      : "-"
                  }
                />
                {/* Locked amount row */}
                <Row
                  label="Amount (LKR)"
                  value={computedAmount.toLocaleString("en-LK")}
                />
              </div>

              <div className="mt-6 space-y-2 text-xs text-slate-500">
                <p>Use test cards, e.g. <span className="font-medium text-slate-700">4242 4242 4242 4242</span> (any future expiry, any CVC).</p>
                <p>3-D Secure demo: You’ll be prompted for a 6-digit code.</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <span className="text-slate-600 text-sm">Status</span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    payment.status === "paid"
                      ? "bg-emerald-100 text-emerald-700"
                      : payment.status === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {payment.status}
                </span>
              </div>
            </div>
          </section>

          {/* Payment form */}
          <section className="lg:col-span-2">
            <form onSubmit={start3DS} noValidate className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Pay with card</h2>
                <AcceptedStrip />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <LabelWrap label="Cardholder name" error={cardTouched && errors.cardName}>
                  <input
                    className="field"
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
                      className="field pr-14"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => onNumberChange(e.target.value)}
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
                    className="field"
                    placeholder="12/28"
                    value={exp}
                    onChange={(e) => onExpChange(e.target.value)}
                    onBlur={() => setCardTouched(true)}
                  />
                </LabelWrap>

                <LabelWrap label="CVC" error={cardTouched && errors.cvc}>
                  <input
                    inputMode="numeric"
                    className="field"
                    placeholder={brand === "amex" ? "1234" : "123"}
                    value={cvc}
                    onChange={(e) => onCvcChange(e.target.value)}
                    onBlur={() => setCardTouched(true)}
                  />
                </LabelWrap>
              </div>

              <label className="mt-6 flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border border-slate-300"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                />
                Save card for faster checkout next time
              </label>

              {serverError && <div className="mt-4 text-rose-600 text-sm">{serverError}</div>}

              <div className="mt-6 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold shadow-sm hover:bg-indigo-700 disabled:opacity-60"
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
              <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                {result?.ticket ? (
                  <div className="grid md:grid-cols-2 gap-6 items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Payment successful</h3>
                      <p className="text-slate-600 text-sm mt-1">
                        Ticket issued for {result.ticket.fullName} — {result.ticket.type}
                        {result.ticket.type === "family" ? ` (${result.ticket.count})` : ""}
                      </p>
                      <div className="mt-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm">
                        Status: Paid • {result.ticket?.payment?.card?.brand?.toUpperCase() || "CARD"} • **** {result.ticket?.payment?.card?.last4}
                      </div>
                    </div>
                    <div className="justify-self-end">
                      <img
                        alt="QR Code"
                        src={result.qr?.dataUrl || result.ticket?.qrDataUrl}
                        className="w-48 h-48 border border-slate-200"
                        style={{ imageRendering: "pixelated" }}
                      />
                      <a
                        className="mt-3 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                        href={result.qr?.dataUrl || result.ticket?.qrDataUrl}
                        download={`ticket_${result.ticket.type}_${result.ticket.nic}.png`}
                      >
                        Download QR
                      </a>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-slate-800">Something went wrong</h3>
                    <p className="text-slate-600 text-sm mt-1">{serverError || "Please try again."}</p>
                  </>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <style>{`
        .field {
          @apply w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500;
        }
      `}</style>

      {/* 3-D Secure modal (simulated) */}
      {threeDSOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-800">3-D Secure Verification</h4>
              <button className="text-slate-400 hover:text-slate-700" onClick={() => setThreeDSOpen(false)} aria-label="Close">✕</button>
            </div>
            <p className="text-slate-600 text-sm mt-2">
              We sent a one-time passcode to your phone. Enter the 6-digit code to authorize this payment.
            </p>
            <input
              inputMode="numeric"
              maxLength={6}
              className="mt-4 field text-center tracking-widest"
              placeholder="______"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D+/g, "").slice(0, 6))}
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50" onClick={() => setThreeDSOpen(false)}>
                Cancel
              </button>
              <button
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
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
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}
function LabelWrap({ label, error, children }) {
  return (
    <label className="block text-sm">
      <span className="text-slate-700 font-medium">{label}</span>
      <div className="mt-1">{children}</div>
      {error ? <p className="text-rose-600 text-xs mt-1">{error}</p> : null}
    </label>
  );
}
