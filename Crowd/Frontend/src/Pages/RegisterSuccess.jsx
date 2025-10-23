import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function RegisterSuccess() {
  const { state } = useLocation();
  const nav = useNavigate();

  const ticket = state?.ticket;
  const qrSrc = state?.qr?.dataUrl || ticket?.qrDataUrl || "";
  const assignedCounter =
    ticket?.assignedCounterDetails || ticket?.assignedCounter || null;
  const assignedCounterName =
    assignedCounter?.name ||
    ticket?.assignedCounterName ||
    ticket?.counterCode ||
    "";

  useEffect(() => {
    if (!ticket) {
      nav("/register", { replace: true });
    }
  }, [ticket, nav]);

  if (!ticket) return null;

  const cardBrand = ticket?.payment?.card?.brand?.toUpperCase() || "CARD";
  const last4 = ticket?.payment?.card?.last4 || "****";
  const amount = ticket?.payment?.amount;
  const paymentStatus = ticket?.payment?.status || "paid";

  return (
    <div className="min-h-screen relative bg-[#0B1120]">
      <img
        src="https://sridaladamaligawa.lk/wp-content/uploads/2020/09/Main-entrnce-Thumbnail-1-768x432.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-10"
      />
      <div className="absolute inset-0 bg-[#0B1120]/90" />

      <header className="absolute top-0 inset-x-0 z-20">
        <nav className="max-w-7xl mx-auto h-14 px-5 flex items-center justify-between">
          <button
            onClick={() => nav("/")}
            className="text-[#E2E8F0] hover:text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition"
          >
            Home
          </button>
          <button
            onClick={() => nav("/register")}
            className="text-[#E2E8F0] hover:text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition"
          >
            New Registration
          </button>
        </nav>
      </header>

      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-4xl bg-[#0F172A] border border-[#334155] rounded-2xl p-6 md:p-8 text-[#E2E8F0] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-[22px] md:text-[24px] leading-[1.2] font-semibold">
                Registration Complete
              </h2>
              <p className="text-[13px] text-[#94A3B8] mt-1">
                Your payment was successful. Present this QR at the event entrance.
              </p>
            </div>
            <Stepper step={2} />
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6">
            <section className="rounded-xl border border-[#334155] bg-[#0b152c]/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-semibold">Ticket Details</h3>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    paymentStatus === "paid"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-amber-500/15 text-amber-300"
                  }`}
                >
                  {paymentStatus}
                </span>
              </div>
              <div className="space-y-2 text-[13px]">
                <Row label="Name" value={ticket.fullName} />
                <Row label="NIC" value={ticket.nic} />
                <Row label="Ticket Type" value={ticket.type} />
                {amount ? (
                  <Row
                    label="Amount"
                    value={`LKR ${Number(amount).toLocaleString("en-LK")}`}
                  />
                ) : null}
                <Row
                  label="Card"
                  value={`${cardBrand} · **** ${last4}`}
                />
              </div>

              {assignedCounter ? (
                <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-3 text-emerald-200 text-[13px]">
                  <p className="text-[13px] font-semibold text-emerald-100">
                    Assigned Counter: <span className="text-white">{assignedCounterName}</span>
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {assignedCounter.status ? (
                      <div>
                        Mode: <span className="text-white">{assignedCounter.status}</span>
                      </div>
                    ) : null}
                    {assignedCounter.entrance ? (
                      <div>
                        Entrance: <span className="text-white">{assignedCounter.entrance}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 p-3 text-amber-100 text-[13px]">
                  Counter assignment pending. Please check with the help desk on arrival.
                </div>
              )}
            </section>

            <section className="rounded-xl border border-[#334155] bg-[#0b152c]/40 p-5 flex flex-col items-center gap-5">
              <div className="text-center">
                <h3 className="text-[16px] font-semibold">QR Ticket</h3>
                <p className="text-[12px] text-[#94A3B8] mt-1">
                  Show this QR code at your assigned counter for faster entry.
                </p>
              </div>
              <img
                alt="QR Code"
                src={qrSrc}
                className="w-48 h-48 border border-[#334155] bg-[#0F172A]"
                style={{ imageRendering: "pixelated" }}
              />
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <a
                  className="flex-1 text-center rounded-xl bg-[#4F46E5] px-4 py-2 text-white hover:bg-[#6366F1]"
                  href={qrSrc}
                  download={`ticket_${ticket.type}_${ticket.nic}.png`}
                >
                  Download QR
                </a>
                <button
                  className="flex-1 rounded-xl border border-[#334155] px-4 py-2 text-[#E2E8F0] hover:bg-white/10"
                  onClick={() => nav("/")}
                >
                  Finish
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-[13px] text-[#94A3B8]">{label}</span>
      <span className="text-[13px] text-[#E2E8F0]">{value || "-"}</span>
    </div>
  );
}

function Stepper({ step = 2 }) {
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
