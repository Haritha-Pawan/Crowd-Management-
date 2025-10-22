// src/pages/register/RegisterOnePage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

/* ================================
   Config & helpers
================================== */
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

const nicRegex = /^(?:\d{12}|\d{9}[VvXx])$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRegex = /^0\d{9}$/;

const PRICING = {
  individual: 100,
  familyPerPerson: 100,
};

const digitsOnly = (s) => String(s || "").replace(/\D+/g, "");

// super-light brand detect (always “card” here; keep shape for UI)
function detectBrand() {
  return { brand: "card", cvcLen: 3 };
}

function parseExpiry(exp) {
  const s = exp.replace(/[^\d]/g, "").slice(0, 4);
  return { mm: s.slice(0, 2), yy: s.slice(2, 4) };
}
function formatExpiryForTyping(v) {
  const s = digitsOnly(v).slice(0, 4);
  if (s.length <= 2) return s;
  return `${s.slice(0, 2)}/${s.slice(2)}`;
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
function formatCardNumber(v) {
  const s = digitsOnly(v).slice(0, 16);
  return s.replace(/(\d{1,4})/g, "$1 ").trim();
}
function allowOnlyDigitsKeyDown(e) {
  const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
  if (allowed.includes(e.key)) return;
  if (!/^\d$/.test(e.key)) e.preventDefault();
}

/* ================================
   Small UI atoms
================================== */
const BrandBadge = ({ brand }) => {
  const c = "h-6";
  if (brand === "visa")
    return (
      <svg viewBox="0 0 48 16" className={c}>
        <rect width="48" height="16" rx="3" fill="#1A1F71" />
        <text x="8" y="11.5" fontSize="9" fill="#fff">VISA</text>
      </svg>
    );
  if (brand === "mastercard")
    return (
      <svg viewBox="0 0 48 16" className={c}>
        <rect width="48" height="16" rx="3" fill="#000" />
        <circle cx="20" cy="8" r="5" fill="#EB001B" />
        <circle cx="28" cy="8" r="5" fill="#F79E1B" />
      </svg>
    );
  if (brand === "amex")
    return (
      <svg viewBox="0 0 48 16" className={c}>
        <rect width="48" height="16" rx="3" fill="#2E77BC" />
        <text x="4" y="11.5" fontSize="7" fill="#fff">AMERICAN</text>
        <text x="4" y="15.5" fontSize="7" fill="#fff">EXPRESS</text>
      </svg>
    );
  if (brand === "discover")
    return (
      <svg viewBox="0 0 48 16" className={c}>
        <rect width="48" height="16" rx="3" fill="#F06000" />
        <text x="6" y="11.5" fontSize="8" fill="#fff">DISCOVER</text>
      </svg>
    );
  return (
    <div className="h-6 px-2 rounded bg-gray-200 text-gray-700 grid place-items-center text-xs">CARD</div>
  );
};
const AcceptedStrip = () => (
  <div className="flex items-center gap-2">
    <BrandBadge brand="visa" />
    <BrandBadge brand="mastercard" />
    <BrandBadge brand="amex" />
    <BrandBadge brand="discover" />
  </div>
);
const Row = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-[13px] text-[#94A3B8]">{label}</span>
    <span className="text-[13px] text-[#E2E8F0]">{value}</span>
  </div>
);
const LabelWrap = ({ label, error, children }) => (
  <label className="block text-sm">
    <span className="u-label">{label}</span>
    <div className="mt-1.5">{children}</div>
    {error ? <p className="u-err">{error}</p> : null}
  </label>
);
const Stepper = ({ step = 1, total = 2 }) => (
  <div className="flex items-center gap-2">
    {Array.from({ length: total }).map((_, i) => (
      <span
        key={i}
        className={`h-2.5 w-10 rounded-full ${i < step ? "bg-[#E2E8F0]" : "bg-[#475569]"}`}
        aria-hidden
      />
    ))}
    <span className="sr-only">Step {step} of {total}</span>
  </div>
);

/* ================================
   Main page
================================== */
export default function RegisterOnePage() {
  // step: 1 = personal, 2 = payment, 3 = receipt
  const [step, setStep] = useState(1);

  // personal form
  const [personal, setPersonal] = useState({
    fullName: "",
    nic: "",
    email: "",
    phone: "",
    type: "individual", // "individual" | "family"
    count: 2,
  });

  // payment state
  const [payment, setPayment] = useState({
    provider: "card",
    status: "pending",
    currency: "LKR",
    card: { brand: "", last4: "", expMonth: "", expYear: "" },
  });
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // card fields
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [saveCard, setSaveCard] = useState(true);
  const [cardTouched, setCardTouched] = useState(false);

  const [threeDSOpen, setThreeDSOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const numberRef = useRef(null);
  const { brand, cvcLen } = useMemo(() => detectBrand(cardNumber), [cardNumber]);

  // compute amount
  const computedAmount = useMemo(() => {
    if (personal.type === "family") {
      const c = Math.max(2, parseInt(personal.count, 10) || 2);
      return c * PRICING.familyPerPerson;
    }
    return PRICING.individual;
  }, [personal.type, personal.count]);

  // personal validation
  const personalErrors = useMemo(() => {
    const e = {};
    if (!personal.fullName.trim()) e.fullName = "Required";
    if (!emailRegex.test(String(personal.email || "").toLowerCase())) e.email = "Invalid email";
    if (!phoneRegex.test(String(personal.phone || ""))) e.phone = "Use 07XXXXXXXX";
    if (!nicRegex.test(String(personal.nic || "").toUpperCase())) e.nic = "Invalid NIC";
    if (!["individual", "family"].includes(personal.type)) e.type = "Pick category";
    if (personal.type === "family") {
      const c = parseInt(personal.count, 10);
      if (!Number.isFinite(c) || c < 2) e.count = "Family count must be ≥ 2";
    }
    if (!(computedAmount > 0)) e.amount = "Amount not available";
    return e;
  }, [personal, computedAmount]);

  // payment validation
  const paymentErrors = useMemo(() => {
    const e = {};
    const rawNum = digitsOnly(cardNumber);
    if (!cardName.trim()) e.cardName = "Cardholder name required";
    if (rawNum.length !== 16) e.cardNumber = "Card number must be 16 digits";
    const { mm, yy } = parseExpiry(exp);
    const m = Number(mm);
    if (!(mm && yy && m >= 1 && m <= 12) || isPastExpiry(mm, yy)) e.exp = "Invalid expiry";
    if (!/^\d{3}$/.test(cvc)) e.cvc = `CVC must be ${cvcLen} digits`;
    return e;
  }, [cardName, cardNumber, exp, cvc, cvcLen]);

  // navigation handlers
  const goNextFromPersonal = () => {
    if (Object.keys(personalErrors).length) {
      // touch all? you can add more UX if needed
      return;
    }
    setStep(2);
  };

  const resetAll = () => {
    setStep(1);
    setPersonal({ fullName: "", nic: "", email: "", phone: "", type: "individual", count: 2 });
    setCardName("");
    setCardNumber("");
    setExp("");
    setCvc("");
    setSaveCard(true);
    setPayment({ provider: "card", status: "pending", currency: "LKR", card: { brand: "", last4: "", expMonth: "", expYear: "" }});
    setServerError("");
    setResult(null);
    setOtp("");
    setThreeDSOpen(false);
  };

  // API submit
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
      const { data } = await api.post("/checkout", payload);
      setResult(data);
      setPayment((p) => ({ ...p, status: "paid" }));
      setStep(3);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Network error";
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 3-D Secure simulate
  const start3DS = async (e) => {
    e.preventDefault();
    setCardTouched(true);
    if (Object.keys(paymentErrors).length) return;
    setThreeDSOpen(true);
    setOtp("");
  };
  const confirm3DS = async () => {
    if (!/^\d{6}$/.test(otp)) return;
    setThreeDSOpen(false);
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1100));
    setSubmitting(false);
    await submitToAPI();
  };

  // input handlers
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
          <div className="text-[#E2E8F0] px-3 py-1.5 rounded-md">Sri Dalada Vandanā</div>
          <Stepper step={step} total={3} />
          <button
            onClick={resetAll}
            className="text-[#E2E8F0] hover:text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition"
          >
            Reset
          </button>
        </nav>
      </header>

      {/* Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-5xl bg-transparent border-0 rounded-2xl p-0 text-[#E2E8F0]">
          {/* Title */}
          <div className="mb-6 md:mb-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[22px] md:text-[24px] leading-[1.2] font-semibold">
                  {step === 1 ? "Registration" : step === 2 ? "Complete Payment" : "Receipt"}
                </h2>
                <p className="text-[13px] text-[#94A3B8] mt-1">
                  {step === 1 ? "Enter your details" : step === 2 ? "Pay securely to receive your QR ticket" : "Payment details & QR ticket"}
                </p>
              </div>
              <Stepper step={step} total={3} />
            </div>
          </div>

          {/* Steps */}
          {step === 1 && (
            <section className="rounded-xl border border-[#334155] bg-[#0b152c]/40 p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <LabelWrap label="Full name" error={personalErrors.fullName}>
                  <input
                    className="u-input"
                    placeholder="Dinusha Lakmal"
                    value={personal.fullName}
                    onChange={(e) => setPersonal((p) => ({ ...p, fullName: e.target.value }))}
                  />
                </LabelWrap>
                <LabelWrap label="NIC" error={personalErrors.nic}>
                  <input
                    className="u-input"
                    placeholder="200012345678 / 981234567V"
                    value={personal.nic}
                    onChange={(e) => setPersonal((p) => ({ ...p, nic: e.target.value }))}
                  />
                </LabelWrap>
                <LabelWrap label="Email" error={personalErrors.email}>
                  <input
                    className="u-input"
                    placeholder="you@example.com"
                    value={personal.email}
                    onChange={(e) => setPersonal((p) => ({ ...p, email: e.target.value }))}
                  />
                </LabelWrap>
                <LabelWrap label="Phone (07XXXXXXXX)" error={personalErrors.phone}>
                  <input
                    className="u-input"
                    placeholder="0712345678"
                    value={personal.phone}
                    onChange={(e) => setPersonal((p) => ({ ...p, phone: e.target.value }))}
                  />
                </LabelWrap>
                <LabelWrap label="Type" error={personalErrors.type}>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 text-[14px]">
                      <input
                        type="radio"
                        name="rtype"
                        checked={personal.type === "individual"}
                        onChange={() => setPersonal((p) => ({ ...p, type: "individual" }))}
                      />
                      Individual (LKR {PRICING.individual})
                    </label>
                    <label className="flex items-center gap-2 text-[14px]">
                      <input
                        type="radio"
                        name="rtype"
                        checked={personal.type === "family"}
                        onChange={() => setPersonal((p) => ({ ...p, type: "family" }))}
                      />
                      Family (LKR {PRICING.familyPerPerson} / person)
                    </label>
                  </div>
                </LabelWrap>
                {personal.type === "family" && (
                  <LabelWrap label="Family count (≥ 2)" error={personalErrors.count}>
                    <input
                      className="u-input"
                      type="number"
                      min={2}
                      value={personal.count}
                      onChange={(e) =>
                        setPersonal((p) => ({ ...p, count: Math.max(2, Number(e.target.value) || 2) }))
                      }
                    />
                  </LabelWrap>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-[13px] text-[#94A3B8]">
                  Amount (LKR):{" "}
                  <span className="text-[#E2E8F0] font-semibold">{computedAmount.toLocaleString("en-LK")}</span>
                </div>
                <button
                  onClick={goNextFromPersonal}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-7 py-2.5 text-[14px] font-semibold text-white shadow-lg hover:bg-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                >
                  Next: Payment →
                </button>
              </div>
            </section>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary */}
              <section className="lg:col-span-1">
                <div className="rounded-xl border border-[#334155] bg-[#0b152c]/40 p-5">
                  <h3 className="text-[16px] font-semibold">Order Summary</h3>
                  <div className="mt-4 space-y-2 text-[13px]">
                    <Row label="Name" value={personal.fullName || "-"} />
                    <Row label="NIC" value={personal.nic || "-"} />
                    <Row
                      label="Type"
                      value={
                        personal.type === "family"
                          ? `family (${personal.count})`
                          : "individual"
                      }
                    />
                    <Row label="Amount (LKR)" value={computedAmount.toLocaleString("en-LK")} />
                  </div>

                  <div className="mt-6 space-y-2 text-[11px] text-[#94A3B8]">
                    <p>
                      Test card: <span className="font-medium text-[#E2E8F0]">4242 4242 4242 4242</span> (future expiry, any CVC).
                    </p>
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
                    <LabelWrap label="Cardholder name" error={cardTouched && paymentErrors.cardName}>
                      <input
                        className="u-input"
                        placeholder="Dinusha Lakmal"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        onBlur={() => setCardTouched(true)}
                      />
                    </LabelWrap>

                    <LabelWrap label="Card number" error={cardTouched && paymentErrors.cardNumber}>
                      <div className="relative">
                        <input
                          ref={numberRef}
                          inputMode="numeric"
                          pattern="\\d*"
                          maxLength={19}
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

                    <LabelWrap label="Expiry (MM/YY)" error={cardTouched && paymentErrors.exp}>
                      <input
                        inputMode="numeric"
                        pattern="\\d*"
                        maxLength={5}
                        className="u-input"
                        placeholder="12/28"
                        value={exp}
                        onChange={(e) => onExpChange(e.target.value)}
                        onBlur={onExpBlur}
                        onKeyDown={allowOnlyDigitsKeyDown}
                      />
                    </LabelWrap>

                    <LabelWrap label="CVC" error={cardTouched && paymentErrors.cvc}>
                      <input
                        inputMode="numeric"
                        pattern="\\d*"
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

                  <div className="mt-6 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#334155] px-5 py-2.5 text-[14px] text-[#E2E8F0] hover:bg-white/10"
                    >
                      ← Back
                    </button>

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

                {/* Receipt (step 3 renders below) */}
              </section>
            </div>
          )}

          {step === 3 && (
            <section className="rounded-xl border border-[#334155] bg-[#0b152c]/40 p-5">
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
                      Status: Paid • {result.ticket?.payment?.card?.brand?.toUpperCase() || "CARD"} • ****{" "}
                      {result.ticket?.payment?.card?.last4}
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        className="rounded-xl bg-[#4F46E5] px-4 py-2 text-white hover:bg-[#6366F1]"
                        onClick={resetAll}
                      >
                        New Registration
                      </button>
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
                  <div className="mt-6">
                    <button
                      onClick={() => setStep(2)}
                      className="rounded-xl bg-[#4F46E5] px-4 py-2 text-white hover:bg-[#6366F1]"
                    >
                      Back to Payment
                    </button>
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      </main>

      {/* Style helpers */}
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
              <button className="text-[#94A3B8] hover:text-white" onClick={() => setThreeDSOpen(false)} aria-label="Close">
                ✕
              </button>
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
              <button
                className="rounded-lg border border-[#334155] px-4 py-2 text-[#E2E8F0] hover:bg-white/10"
                onClick={() => setThreeDSOpen(false)}
              >
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
