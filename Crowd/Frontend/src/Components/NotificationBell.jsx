// Components/NotificationBell.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

export default function NotificationBell({ currentUser, socket }) {
  const [open, setOpen] = useState(false);
  const [inbox, setInbox] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio("/new-notification-021-370045.mp3");
  }, []);

  // Initial fetch by role
  useEffect(() => {
    if (!currentUser?.role) return;
    api.get(`/notifications/inbox?role=${encodeURIComponent(currentUser.role)}`)
      .then((r) => setInbox(r.data || []))
      .catch(() => {});
  }, [currentUser?.role]);

  // Real-time
  useEffect(() => {
    if (!socket) return;
    const handler = (doc) => {
      setInbox((prev) => [doc, ...prev]);
      audioRef.current?.play().catch(() => {});
    };
    socket.on("notification:new", handler);
    
    return () => {
      socket.off("notification:new", handler);
    };
  }, [socket]);

  const handleOpen = () => setOpen((o) => !o);
  const list = useMemo(() => inbox.slice(0, 15), [inbox]);

  return (
    <div className="relative">
      <button onClick={handleOpen} className="relative p-2 rounded-full hover:bg-white/10" aria-label="Notifications">
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
