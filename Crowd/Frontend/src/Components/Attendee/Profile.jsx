// src/pages/attendee/Profile.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  QrCode,
  IdCard,
  Mail,
  Phone,
  CreditCard,
  Download,
  Loader2,
  AlertTriangle,
  User2,
  Hash,
  Receipt,
  CalendarClock,
  ShieldCheck,
  Copy,
} from "lucide-react";

// ---- axios instance (adds JWT automatically) ----
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") || "http://${API_BASE_URL}/api",
  withCredentials: true,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const Label = ({ children }) => (
  <div className="text-xs uppercase tracking-wide text-white/60">{children}</div>
);

const Field = ({ icon, label, value }) => (
  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
    <div className="flex items-center gap-2 text-white/80 mb-1">
      {icon}
      <Label>{label}</Label>
    </div>
    <div className="text-white font-medium break-words">{value || "—"}</div>
  </div>
);

export default function Profile() {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // read NIC (you can also decode from JWT if you want)
  const nic = (localStorage.getItem("nic") || "").trim();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        // 🔹 adjust path if your backend differs (e.g. "/tickets/mine")
        const res = await api.get(`/tickets`, { params: { nic } });
        // normalize: backend may return {ticket: ...} | [...] | {...}
        const raw = res.data?.ticket ?? res.data;
        const data = Array.isArray(raw) ? raw[0] : raw;
        if (mounted) setTicket(data || null);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || "Failed to load ticket data");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [nic]);

  const qrSrc = useMemo(() => {
    if (ticket?.qrDataUrl) return ticket.qrDataUrl; // stored PNG as data URL
    const payload = ticket?.qrPayload || ticket?.payload;
    if (payload) {
      const data = encodeURIComponent(payload);
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data}`;
    }
    return null;
  }, [ticket]);

  const downloadQR = () => {
    if (!qrSrc) return;
    const a = document.createElement("a");
    a.href = qrSrc;
    a.download = `QR_${ticket?.nic || "ticket"}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const copyToClipboard = async (txt) => {
    try {
      await navigator.clipboard.writeText(txt || "");
    } catch {
      /* no-op */
    }
  };

  if (!nic) {
    return (
      <div className="flex items-center justify-center text-white/80 mt-24">
        <AlertTriangle className="mr-2" /> No NIC found in this browser. Please log in again.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center text-white/80 mt-24">
        <Loader2 className="mr-2 animate-spin" /> Loading profile…
      </div>
    );
  }

  if (err) {
    return (
      <div className="flex items-center justify-center text-rose-300 mt-24">
        <AlertTriangle className="mr-2" /> {err}
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center text-white/80 mt-24">
        No ticket found for NIC <span className="ml-2 font-semibold">{nic}</span>.
      </div>
    );
  }

  const createdAt = ticket.createdAt ? new Date(ticket.createdAt) : null;
  const updatedAt = ticket.updatedAt ? new Date(ticket.updatedAt) : null;

  return (
    <div className="p-6 pb-16 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Attendee Profile</h1>
          <div className="text-white/70 mt-1">
            Manage your registration, QR and payment details
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2">
          <div className="text-xs text-white/60">NIC</div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{ticket.nic}</span>
            <button
              onClick={() => copyToClipboard(ticket.nic)}
              className="p-1 rounded hover:bg-white/10"
              title="Copy NIC"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column — Personal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <User2 size={20} />
              <div className="text-lg font-semibold">Personal Information</div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field icon={<IdCard size={16} />} label="Full Name" value={ticket.fullName} />

              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-2 text-white/80 mb-1">
                  <Mail size={16} />
                  <Label>Email</Label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium break-all">{ticket.email || "—"}</span>
                  {ticket.email && (
                    <button
                      onClick={() => copyToClipboard(ticket.email)}
                      className="p-1 rounded hover:bg-white/10"
                      title="Copy Email"
                    >
                      <Copy size={14} />
                    </button>
                  )}
                </div>
              </div>

              <Field icon={<Phone size={16} />} label="Phone" value={ticket.phone} />
              <Field icon={<Hash size={16} />} label="Ticket Type" value={ticket.type} />
              <Field icon={<Receipt size={16} />} label="Count" value={String(ticket.count ?? "—")} />
              <Field
                icon={<ShieldCheck size={16} />}
                label="Created"
                value={createdAt ? createdAt.toLocaleString() : "—"}
              />
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={20} />
              <div className="text-lg font-semibold">Payment</div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field icon={<ShieldCheck size={16} />} label="Status" value={ticket.payment?.status} />
              <Field icon={<Receipt size={16} />} label="Provider" value={ticket.payment?.provider || "—"} />
              <Field
                icon={<Receipt size={16} />}
                label="Amount"
                value={
                  ticket.payment?.amount != null
                    ? `${ticket.payment?.currency || "LKR"} ${Number(ticket.payment.amount).toLocaleString()}`
                    : "—"
                }
              />
              <Field
                icon={<CreditCard size={16} />}
                label="Card"
                value={
                  ticket.payment?.card?.brand
                    ? `${ticket.payment.card.brand} •••• ${ticket.payment.card.last4 || ""}`
                    : "—"
                }
              />
            </div>

            {updatedAt && (
              <div className="mt-3 flex items-center gap-2 text-white/60 text-sm">
                <CalendarClock size={16} />
                Last update: {updatedAt.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Right column — QR */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <QrCode size={20} />
            <div className="text-lg font-semibold">Entry QR</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-white rounded-xl p-3 shadow-inner">
              {qrSrc ? (
                <img src={qrSrc} alt="Ticket QR" className="w-48 h-48 object-contain" />
              ) : (
                <div className="w-48 h-48 grid place-items-center text-black/60">QR Unavailable</div>
              )}
            </div>

            <button
              onClick={downloadQR}
              disabled={!qrSrc}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 font-medium"
            >
              <Download size={18} /> Download QR
            </button>

            <div className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
              <Label>Encoded Payload</Label>
              <div className="mt-1 break-words text-white/80">
                {ticket.qrPayload || ticket.payload || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
