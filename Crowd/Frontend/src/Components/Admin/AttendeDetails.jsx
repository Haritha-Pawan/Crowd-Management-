import React, { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_LANDING_API || "http://localhost:3001/api/checkout";

function fmtDate(s) {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}
function moneyLKR(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(v);
}

export default function AttendeeGrid() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });

  const fetchData = async (p = page, query = q) => {
    try {
      setBusy(true);
      setErr("");
      const params = new URLSearchParams({ page: String(p), limit: "12" }); // show 12 per page
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`${API}?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || `Error ${res.status}`);
      setData(json);
      setPage(json.page || p);
    } catch (e) {
      setErr(e.message || "Failed to load attendees");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { fetchData(1, ""); }, []);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((data.total || 0) / (data.limit || 12))),
    [data]
  );

  return (
    <div className="mt-4">
      {/* Search row matches the “Search Attendee” box */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          className="w-full sm:max-w-sm rounded-lg border border-white/15 bg-white/10 px-4 py-2.5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Search by name or NIC"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") fetchData(1, q); }}
        />
        <div className="flex gap-2">
          <button
            onClick={() => fetchData(1, q)}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-500"
            disabled={busy}
          >
            Search
          </button>
          <button
            onClick={() => { setQ(""); fetchData(1, ""); }}
            className="rounded-lg bg-white/10 px-4 py-2.5 text-white hover:bg-white/20"
            disabled={busy}
          >
            Reset
          </button>
        </div>
        <div className="ml-auto text-white/80 text-sm">
          Total: {data.total}
        </div>
      </div>

      {/* Responsive grid of attendee cards */}
      {busy && <div className="text-white/70 py-8 text-center">Loading…</div>}
      {err && !busy && <div className="text-rose-300 py-8 text-center">{err}</div>}
      {!busy && !err && data.items.length === 0 && (
        <div className="text-white/70 py-8 text-center">No attendees found.</div>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.items.map((t) => (
          <div key={`${t._id}-${t.nic}`}
               className="rounded-xl border border-white/10 bg-white/5 p-4 text-white hover:bg-white/10 transition">
            <div className="flex items-start justify-between">
              <div className="font-semibold">{t.fullName || "—"}</div>
              <span className={`inline-flex rounded px-2 py-0.5 text-xs ${
                t?.payment?.status === "paid" ? "bg-emerald-600/20 text-emerald-300" :
                t?.payment?.status === "failed" ? "bg-rose-600/20 text-rose-300" :
                "bg-amber-600/20 text-amber-300"
              }`}>
                {t?.payment?.status || "—"}
              </span>
            </div>

            <div className="mt-2 text-sm space-y-1">
              <div className="text-white/80"><span className="text-white/60">NIC:</span> <span className="font-mono">{t.nic || "—"}</span></div>
              <div className="text-white/80"><span className="text-white/60">Phone:</span> <span className="font-mono">{t.phone || "—"}</span></div>
              <div className="text-white/80"><span className="text-white/60">Type:</span> {t.type}{t.type === "family" ? ` (${t.count || 0})` : ""}</div>
              <div className="text-white/80"><span className="text-white/60">Amount:</span> {moneyLKR(t?.payment?.amount)}</div>
              <div className="text-white/80"><span className="text-white/60">Counter:</span> {t.assignedCounterName || "—"}</div>
              <div className="text-white/60 text-xs">{fmtDate(t.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-5 flex items-center gap-2 text-white/80">
        <button
          onClick={() => fetchData(Math.max(1, page - 1), q)}
          disabled={busy || page <= 1}
          className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/20 disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-sm">Page {page} / {totalPages}</span>
        <button
          onClick={() => fetchData(Math.min(totalPages, page + 1), q)}
          disabled={busy || page >= totalPages}
          className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/20 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
