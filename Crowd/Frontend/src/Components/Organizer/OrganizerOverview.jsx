import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {PieChart,Pie,Cell,ResponsiveContainer,BarChart,Bar,XAxis,YAxis,Tooltip,CartesianGrid,Legend,} from "recharts";

const API = "http://localhost:5000/api";

const OrganizerOverview = () => {
  const [tasks, setTasks] = useState([]);
  const [zones, setZones] = useState([]);

  // load data
  useEffect(() => {
    (async () => {
      try {
        const t = await axios.get(`${API}/tasks`);
        setTasks(t.data || []);
      } catch (e) {
        console.error("tasks load", e);
      }

      try {
        // try /parkingzones then fallback to /parking-zone
        let z;
        try {
          z = await axios.get(`${API}/parkingzones`);
        } catch {
          z = await axios.get(`${API}/parking-zone`);
        }
        setZones(z.data || []);
      } catch (e) {
        console.error("zones load", e);
      }
    })();
  }, []);

  // ===== TASK KPIs =====
  const totalTasks = tasks.length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const completed = tasks.filter((t) => t.status === "done").length;
  const overdue = tasks.filter((t) => {
    if (!t.dueDate || t.status === "done") return false;
    const due = new Date(t.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  // ===== PARKING KPIs =====
  // assume zone has capacity; optionally zone.load (occupied) and zone.reserved
  const totalSlots = zones.reduce((s, z) => s + (Number(z.capacity) || 0), 0);
  const occupied = zones.reduce((s, z) => s + (Number(z.load) || 0), 0);
  const reserved = zones.reduce((s, z) => s + (Number(z.reserved) || 0), 0);
  const available = Math.max(totalSlots - occupied - reserved, 0);

  // ===== CHART DATA =====
  const taskPieData = [
    { name: "Done", value: completed },
    { name: "In Progress", value: inProgress },
    {
      name: "Todo/Blocked/Other",
      value: Math.max(totalTasks - completed - inProgress, 0),
    },
  ];
  const taskPieColors = ["#22c55e", "#f59e0b", "#64748b"];

  const parkingBarData = zones.map((z) => {
    const cap = Number(z.capacity) || 0;
    const occ = Number(z.load) || 0;
    const res = Number(z.reserved) || 0;
    return {
      name: z.name || "Zone",
      Occupied: Math.min(occ, cap),
      Reserved: Math.min(res, Math.max(cap - occ, 0)),
      Available: Math.max(cap - occ - res, 0),
    };
  });

  // ===== TEAM SNAPSHOT =====
  const team = useMemo(() => {
    const map = new Map();
    tasks.forEach((t) => {
      const key = (t.coordinator || "Unassigned").trim();
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [tasks]);

  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  return (
    <div className="w-full px-8">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-white text-3xl font-bold">Overview Dashboard</h1>
        <p className="text-white/70">Quick insights into your event operations</p>
        <div className="text-white/60 text-sm mt-1">Today: {today}</div>
      </div>

      {/* KPI CARDS */}
      <h2 className="text-white text-xl font-semibold mb-4">Tasks</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <KPI title="Total Tasks" value={totalTasks} />
        <KPI title="In Progress" value={inProgress} />
        <KPI title="Completed" value={completed} />
        <KPI title="Overdue" value={overdue} /><br />
        </div>

        <h2 className="text-white text-xl font-semibold mb-4">Parking</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <KPI title="Total Slots" value={totalSlots} />
        <KPI title="Available" value={available} />
        <KPI title="Reserved" value={reserved} />
        <KPI title="Occupied" value={occupied} />
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-white font-semibold mb-3">Task Status</div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={taskPieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {taskPieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={taskPieColors[i % taskPieColors.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-white font-semibold mb-3">
            Parking Utilization by Zone
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={parkingBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Available" stackId="a" />
                <Bar dataKey="Reserved" stackId="a" />
                <Bar dataKey="Occupied" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TEAM SNAPSHOT */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mt-8">
        <div className="text-white font-semibold mb-3">
          Team / Coordinator Snapshot
        </div>
        {team.length === 0 ? (
          <div className="text-white/60 text-sm">No assignments yet.</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {team.map((m) => (
              <li key={m.name} className="py-3 flex items-center justify-between">
                <span className="text-white">{m.name}</span>
                <span className="text-white/80 text-sm">
                  {m.count} task{m.count === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/* ========== little helper card ========== */
function KPI({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-white/70 text-sm">{title}</div>
      <div className="text-white text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}

export default OrganizerOverview;
