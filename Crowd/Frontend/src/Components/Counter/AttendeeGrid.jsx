// src/Pages/Counter/AttendeeGrid.jsx
import React, { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_LANDING_API || "http://localhost:3001/api/checkout";

function fmtDate(s) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
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
      const params = new URLSearchParams({ page: String(p), limit: "20" });
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`${API}?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || `Error ${res.status}`);
      setData(json);
    } catch (e) {
      setErr(e.message || "Failed to load attendees");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { fetchData(1, ""); }, []); // initial

  const totalPages = useMemo(() => Math.max(1, Math.ceil((data.total || 0) / (data.limit || 20))), [data]);

  return (
    <div className="w-full p-6">
      <h1 className="text-white text-2xl font-semibold mb-4">Attendees</h1>

      {/* Controls */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          className="w-full sm:max-w-xs rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Search by name or NIC"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") fetchData(1, q); }}
        />
        <div className="flex gap-2">
          <button
            onClick={() => fetchData(1, q)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
            disabled={busy}
          >
            Search
          </button>
          <button
            onClick={() => { setQ(""); fetchData(1, ""); }}
            className="rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20"
            disabled={busy}
          >
            Reset
          </button>
        </div>
        <div className="ml-auto text-white/80 text-sm">
          Total: {data.total}
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/10 text-white/80">
            <tr>
              <Th>Name</Th>
              <Th>NIC</Th>
              <Th>Type</Th>
              <Th>Count</Th>
              <Th>Phone</Th>
              <Th>Payment</Th>
              <Th>Amount</Th>
            
              <Th>Created</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {busy && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-white/70">Loading…</td>
              </tr>
            )}
            {!busy && err && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-red-300">{err}</td>
              </tr>
            )}
            {!busy && !err && data.items.length === 0 && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-white/70">No attendees found.</td>
              </tr>
            )}
            {!busy && !err && data.items.map((t) => (
              <tr key={`${t._id}-${t.nic}`} className="hover:bg-white/5">
                <Td>{t.fullName || "—"}</Td>
                <Td className="font-mono">{t.nic || "—"}</Td>
                <Td className="uppercase">{t.type || "—"}</Td>
                <Td>{t.type === "family" ? (t.count || 0) : 1}</Td>
                <Td className="font-mono">{t.phone || "—"}</Td>
                <Td>
                  <span className={`inline-flex rounded px-2 py-0.5 text-xs ${
                    t?.payment?.status === "paid" ? "bg-emerald-600/20 text-emerald-300" :
                    t?.payment?.status === "failed" ? "bg-rose-600/20 text-rose-300" :
                    "bg-amber-600/20 text-amber-300"
                  }`}>
                    {t?.payment?.status || "—"}
                  </span>
                </Td>
                <Td>{moneyLKR(t?.payment?.amount)}</Td>
                
                <Td className="whitespace-nowrap">{fmtDate(t.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center gap-2 text-white/80">
        <button
          onClick={() => { const p = Math.max(1, data.page - 1); setPage(p); fetchData(p, q); }}
          disabled={busy || data.page <= 1}
          className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/20 disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-sm">
          Page {data.page} / {totalPages}
        </span>
        <button
          onClick={() => { const p = Math.min(totalPages, data.page + 1); setPage(p); fetchData(p, q); }}
          disabled={busy || data.page >= totalPages}
          className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/20 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-4 py-3 text-left font-semibold">{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 text-white ${className}`}>{children}</td>;
}
