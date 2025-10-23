import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check } from "lucide-react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function NotificationBell({ currentUser, socket }) {
  const [open, setOpen] = useState(false);
  const [inbox, setInbox] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio("/new-notification-021-370045.mp3");
  }, []);

  // initial fetch (UNREAD only, server filters by JWT)
  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.get("/notifications/inbox");
        setInbox(r.data || []);
      } catch {
        /* ignore */
      }
    };
    load();
  }, []);

  // helper: case-insensitive role check
  const matchesMyRole = (roles, userRole) =>
    Array.isArray(roles) &&
    typeof userRole === "string" &&
    roles.some((r) => String(r).toLowerCase() === userRole.toLowerCase());

  // realtime push (case-insensitive role match) — listen to both new & legacy events
  useEffect(() => {
    if (!socket) return;

    const handler = (doc) => {
      if (matchesMyRole(doc?.recipientRoles, currentUser?.role)) {
        setInbox((prev) => (prev.some((n) => n._id === doc._id) ? prev : [doc, ...prev]));
        audioRef.current?.play().catch(() => {});
      }
    };

    socket.on("notification:new", handler);
    socket.on("newNotification", handler); // legacy

    return () => {
      socket.off("notification:new", handler);
      socket.off("newNotification", handler);
    };
  }, [socket, currentUser?.role]);

  const list = useMemo(() => inbox.slice(0, 15), [inbox]);

  // just toggle dropdown — NO auto read
  const handleOpen = () => setOpen((o) => !o);

  // mark one explicitly
  const markOne = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setInbox((prev) => prev.filter((n) => n._id !== id));
    } catch {
      /* ignore */
    }
  };

  // mark all explicitly
  const markAll = async () => {
    try {
      const ids = inbox.map((n) => n._id);
      if (!ids.length) return;
      await api.post(`/notifications/read-all`, { ids });
      setInbox([]);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-white/10"
        aria-label="Notifications"
      >
        <Bell size={22} />
        {inbox.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            {inbox.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-[#0f172a] border border-white/10 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <span className="font-semibold text-white">Notifications</span>
            <button
              onClick={markAll}
              className="text-xs text-white/80 hover:text-white flex items-center gap-1"
              title="Mark all as read"
            >
              <Check size={14} /> Mark all
            </button>
          </div>

          <ul className="max-h-96 overflow-y-auto divide-y divide-white/5">
            {list.length === 0 ? (
              <li className="p-3 text-sm text-gray-400">No notifications.</li>
            ) : (
              list.map((n) => (
                <li key={n._id} className="p-3 hover:bg-white/5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-white">{n.title}</div>
                      <div className="text-sm text-gray-300">{n.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => markOne(n._id)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                      title="Mark as read"
                    >
                      Mark read
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
