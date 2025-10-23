import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, UserCheck, Clock1, ScanLineIcon, SearchIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

const API_BASE = "http://localhost:5000/api/checkout";

const formatDateTime = (value) => {
  if (!value) return "-";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const CounterStaffOverview = () => {
  const [stats, setStats] = useState({ total: 0, totalAttendees: 0, checkedIn: 0, pending: 0, checkedInAttendees: 0 });
  const [scanLogs, setScanLogs] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [search, setSearch] = useState("");

  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetch(`${API_BASE}/stats`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Failed to load stats (${res.status})`);
      setStats({
        total: Number(data.total) || 0,
        totalAttendees: Number(data.totalAttendees) || Number(data.total) || 0,
        checkedIn: Number(data.checkedIn) || 0,
        pending: Number.isFinite(data.pending)
          ? Number(data.pending)
          : Math.max(0, (Number(data.total) || 0) - (Number(data.checkedIn) || 0)),
        checkedInAttendees: Number(data.checkedInAttendees) || 0,
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load stats");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadScanLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      const res = await fetch(`${API_BASE}/scan-logs?limit=200`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Failed to load scans (${res.status})`);
      setScanLogs(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load scans");
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadScanLogs();
  }, [loadStats, loadScanLogs]);

  useEffect(() => {
    const handler = () => {
      loadStats();
      loadScanLogs();
    };
    window.addEventListener("qr-scan-success", handler);
    return () => window.removeEventListener("qr-scan-success", handler);
  }, [loadStats, loadScanLogs]);

  const cards = useMemo(() => {
    const totalTickets = stats.total || 0;
    const totalAttendees = stats.totalAttendees || totalTickets;
    const checkedInTickets = stats.checkedIn || 0;
    const pendingTickets = stats.pending ?? Math.max(0, totalTickets - checkedInTickets);
    const checkedInAttendees = stats.checkedInAttendees || checkedInTickets;
    const pendingAttendees = Math.max(0, totalAttendees - checkedInAttendees);

    const checkedPct = totalTickets ? Math.round((checkedInTickets / totalTickets) * 100) : 0;
    const pendingPctAttendees = totalAttendees
      ? Math.round((pendingAttendees / totalAttendees) * 100)
      : 0;

    return [
      {
        title: "Total Attendees",
        icon: <Users size={26} className="text-sky-200" />,
        count: totalAttendees.toLocaleString("en-LK"),
        summary: `${totalTickets.toLocaleString("en-LK")} tickets generated`,
      },
      {
        title: "Checked In",
        icon: <UserCheck size={26} className="text-emerald-200" />,
        count: checkedInAttendees.toLocaleString("en-LK"),
        summary: `${checkedInTickets.toLocaleString("en-LK")} tickets • ${checkedPct}% processed`,
      },
      {
        title: "Pending",
        icon: <Clock1 size={26} className="text-amber-200" />,
        count: pendingAttendees.toLocaleString("en-LK"),
        summary: `${pendingPctAttendees}% of attendees still pending (${pendingTickets.toLocaleString(
          "en-LK"
        )} tickets)`,
      },
    ];
  }, [stats]);

  const filteredLogs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return scanLogs;
    return scanLogs.filter((log) => {
      return (
        log.fullName?.toLowerCase().includes(term) ||
        log.nic?.toLowerCase().includes(term) ||
        (log.counterName || "-").toLowerCase().includes(term)
      );
    });
  }, [scanLogs, search]);

  return (
    <div className="min-h-screen bg-[#102149] px-6 py-10 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#153068] to-[#1d4190] px-10 py-9 text-white shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Counter Staff Dashboard
              </h1>
              <p className="mt-1 text-sm text-indigo-100/80">
                Manage attendee check-ins with QR scanning
              </p>
            </div>
            <Link
              to="/QRScanner"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#5868ff] via-[#7b4dff] to-[#af39ff] px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-500/40 transition hover:scale-[1.02]"
            >
              <ScanLineIcon size={18} />
              QR Scanner
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <div
                key={card.title}
                className="rounded-[24px] border border-white/10 bg-white/10 px-8 py-7 shadow-inner shadow-black/20 transition hover:border-indigo-200/40"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-indigo-100/70">
                  {card.title}
                  {card.icon}
                </div>
                <div className="mt-4 text-5xl font-semibold tracking-tight">{card.count}</div>
                <p className="mt-3 text-xs text-indigo-100/70">{card.summary}</p>
                {loadingStats && <p className="mt-4 text-[11px] text-indigo-200/80">Refreshing data...</p>}
              </div>
            ))}
          </div>
        </div>

        <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 px-10 py-8 text-white shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Recent scans</h2>
            <div className="relative w-full max-w-sm">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-indigo-200/70" size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/10 py-2 pl-10 pr-4 text-sm text-white placeholder:text-indigo-100/60 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-300/60"
                placeholder="Search by name, NIC or counter"
              />
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-sm text-white">
              <thead className="bg-white/10 text-xs uppercase tracking-wide text-indigo-100/80">
                <tr>
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">NIC</th>
                  <th className="px-5 py-3 text-left">Type</th>
                  <th className="px-5 py-3 text-left">Counter</th>
                  <th className="px-5 py-3 text-center">Group size</th>
                  <th className="px-5 py-3 text-left">Scanned at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loadingLogs ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-6 text-center text-indigo-100/80">
                      Loading scans...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-6 text-center text-indigo-100/80">
                      No scans found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr
                      key={log._id || `${log.ticketId}-${log.createdAt}`}
                      className="bg-white/5/10 transition hover:bg-indigo-500/10"
                    >
                      <td className="px-5 py-3">{log.fullName}</td>
                      <td className="px-5 py-3 text-indigo-100/80">{log.nic}</td>
                      <td className="px-5 py-3 capitalize text-indigo-100/90">
                        {log.type}
                        {log.type === "family" ? ` (${log.count})` : ""}
                      </td>
                      <td className="px-5 py-3">{log.counterName || "-"}</td>
                      <td className="px-5 py-3 text-center">{log.count || 1}</td>
                      <td className="px-5 py-3 text-indigo-100/80">{formatDateTime(log.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CounterStaffOverview;
