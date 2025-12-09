// Attendee/Overview.jsx
import { useEffect, useRef, useState } from "react";
import { Car, QrCode, MapPin, TriangleAlert, CalendarCheck2 } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import NotificationBell from "../../Components/NotificationBell";

// ---- inline API helper ----
const api = axios.create({
  

  baseURL: "https://crowd-management-api.onrender.com/api",
  withCredentials: true,
});

export default function Overview() {
  // Replace with your auth user
  const currentUser = {
    id: localStorage.getItem("uid") || "64f0aa...mock",
    role: "Attendee",
    name: "Haritha Pawan",
  };

  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  // StrictMode guard against double socket init
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  // Notification sound
  const audioRef = useRef(null);
  useEffect(() => {
    // put new-notification-021-370045.mp3 in your Vite "public" folder
    audioRef.current = new Audio("/new-notification-021-370045.mp3");
  }, []);

  // initial inbox fetch helper (include role header so backend knows who you are)
  const loadInbox = async () => {
    try {
      const res = await api.get("/notifications/inbox", {
        headers: { "x-user-role": currentUser.role },
      });
      setNotifications(res.data || []);
    } catch {
      // ignore for now
    }
  };

  // Create socket once (like your Incidents page) + realtime notifications
  useEffect(() => {
    if (socketRef.current) return; // prevent double init in React Strict Mode

    const s = io("http://${API_BASE_URL}", { withCredentials: true });
    socketRef.current = s;
    setSocket(s);

    // join role room (simple setup)
    if (currentUser?.role) {
      s.emit("join", { role: currentUser.role });
    }

    // initial inbox
    loadInbox();

    // realtime — listen to ONE event to avoid duplicates
    const handler = (doc) => {
      setNotifications((prev) => [doc, ...prev]);
      setToast({ title: doc.title, message: doc.message, at: doc.createdAt });
      audioRef.current?.play().catch(() => {});
      setTimeout(() => setToast(null), 5000);
    };
    s.on("notification:new", handler);

    return () => {
      s.off("notification:new", handler);
      s.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ======== your team’s layout data (unchanged) ========
  const details = [
    { title: "Entry Status", sub: "Registered", Counter: "Counter A1", icon: <QrCode size={24} color="#3b82f6" /> },
    { title: "parking status ", sub: "Available", Counter: "Zone A-45 spots left", icon: <Car size={24} color="#47cd81" /> },
    { title: "Complaint ", sub: "2", Counter: "1 pending 1 resolved", icon: <TriangleAlert size={24} color="#f0c51b" /> },
  ];

  const btndetails = [
    { icon: <Car size={24} color="#4CB6DD" />, text: "Check Parking Availability", to: "/attendee/parking" },
    { icon: <MapPin size={24} color="red" />, text: "View Event Map", to: null },
    { icon: <TriangleAlert size={24} color="#f0c51b" />, text: "Submit Complaint", to: "/attendee/incidentReport" },
    { icon: <CalendarCheck2 size={24} color="#0EEF7E" />, text: "Event Schedule", to: null },
  ];

  return (
    <div className="p-5 pt-8 pb-16">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-5 right-5 bg-white/90 shadow-md rounded p-4 max-w-sm cursor-pointer z-50"
          onClick={() => setToast(null)}
        >
          <div className="font-bold text-gray-800">{toast.title}</div>
          <div className="text-gray-700">{toast.message}</div>
          <div className="text-xs text-gray-500 mt-1">{new Date(toast.at).toLocaleString()}</div>
        </div>
      )}

      {/* Header with NotificationBell on the right */}
      <div className="flex items-start justify-between">
        <div>
          <div className="title text-white text-3xl font-bold">Welcome, {currentUser.name}</div>
          <div className="sub text-(--color-secondary) mt-2">Your event Dashbord and quick access tools</div>
        </div>
        <NotificationBell currentUser={currentUser} socket={socket} />
      </div>

      {/* KPI cards (team layout) */}
      <div className="2xl:grid-cols-3 grid grid-cols-3 md:grid-cols-3 2xl:gap-24 xl:gap-22 mt-10">
        {details.map((d, index) => (
          <div
            key={index}
            className="bg-white/10 p-4 text-white rounded-md border border-white/5 shadowd-md"
          >
            <div className="Entry flex justify-between 2xl:w-[390px] xl:w-[270px] text-xl font-bold">
              {d.title}
              <div className="Qr">{d.icon}</div>
            </div>
            <div className="tedt-xl font-bold">{d.sub}</div>
            <div className=" mt-3 text-x text-(--color-secondary)">Counter : {d.Counter}</div>
          </div>
        ))}
      </div>

      {/* QR + Quick Actions (team layout) */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-10 mt-10">
        <div className="QR bg-white/10 p-4 rounded-md border border-white/5 shadow-md">
          <div className="text-xl font-bold text-white">Your QR Code</div>
          <div className="text-(--color-secondary)">Use this for event entry and services</div>

          <div className="QR-Code flex justify-center mt-4">
            <div className="bg-white rounded-md p-4">
              <QrCode size={100} color="black" />
            </div>
          </div>

          <div className="text-center text-(--color-secondary) mt-2">
            ID: QR-1701234567-abc123def
          </div>

          <div className="bg-[#3b82f6] text-white font-semibold p-2 rounded-md mt-4 text-center cursor-pointer hover:bg-[#2563eb] transition mb-6">
            Download QR Code
          </div>
        </div>

        <div className="QR bg-white/10 p-4 rounded-md border border-white/5 shadow-md">
          <div className="text-xl font-bold text-white">Quick Action</div>
          <div className="text-(--color-secondary)">Use this for event entry and services</div>

          {btndetails.map((b, index) =>
            b.to ? (
              <Link
                key={index}
                to={b.to}
                className="bg-white/10 border border-white/10 shadow-md text-white font-semibold p-2 rounded-md mt-4 text-center cursor-pointer hover:bg-[#2563eb] transition flex gap-5"
              >
                <div className="icon">{b.icon}</div>
                {b.text}
              </Link>
            ) : (
              <div
                key={index}
                className="bg-white/10 border border-white/10 shadow-md text-white font-semibold p-2 rounded-md mt-4 text-center flex gap-5 opacity-60 cursor-not-allowed"
              >
                <div className="icon">{b.icon}</div>
                {b.text}
              </div>
            )
          )}
        </div>
      </div>

      {/* Latest notifications (added — spacing so it doesn't touch bottom) */}
      <div className="mt-10 text-white">
        <h3 className="text-xl font-bold mb-3">Latest Notifications</h3>
        {notifications.length === 0 ? (
          <p className="text-gray-300">No notifications yet.</p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.map((n) => (
              <li key={n._id} className="bg-white/10 p-3 rounded-md flex justify-between">
                <div>
                  <h4 className="font-semibold">{n.title}</h4>
                  <p className="text-gray-300">{n.message}</p>
                  <p className="text-gray-400 text-sm">
                    {n.recipientRoles?.length
                      ? `Roles: ${n.recipientRoles.join(", ")}`
                      : "Direct message"}
                  </p>
                </div>
                <span className="text-gray-400">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
