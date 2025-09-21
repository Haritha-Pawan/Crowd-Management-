import React, { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

const CoordinatorOverview = () => {
  // Sample data
  const eventInfo = {
    name: "Tech Expo 2025",
    location: "Main Hall",
    date: "2025-09-10",
  };

  const coordinatorInfo = {
    name: "John Doe",
    email: "john.doe@example.com",
  };

  const tasks = [
    { status: "Todo", count: 5 },
    { status: "In Progress", count: 3 },
    { status: "Done", count: 8 },
    { status: "Blocked", count: 2 },
  ];

  const incidents = [
    { status: "Lost Person", count: 4 },
    { status: "Emergency", count: 6 },
    { status: "Lost Item", count: 2 },
  ];

  const [animatedTasks, setAnimatedTasks] = useState(tasks.map(() => 0));
  const [animatedIncidents, setAnimatedIncidents] = useState(
    incidents.map(() => 0)
  );

  const [notifications, setNotifications] = useState([
    { id: 1, title: "Parking Alert", message: "Zone B is full", date: "2025-09-05", recipients: ["Attendees"] },
    { id: 2, title: "Food Stall Delay", message: "Stall 3 delayed", date: "2025-09-05", recipients: ["Staff"] },
  ]);

  const [showNotifPopup, setShowNotifPopup] = useState(false);
  const [newNotif, setNewNotif] = useState({ title: "", message: "", recipients: [] });

  // Animate bars on mount
  useEffect(() => {
    tasks.forEach((task, idx) => {
      let start = 0;
      const interval = setInterval(() => {
        start++;
        setAnimatedTasks((prev) => {
          const copy = [...prev];
          copy[idx] = start;
          return copy;
        });
        if (start >= task.count) clearInterval(interval);
      }, 100);
    });

    incidents.forEach((incident, idx) => {
      let start = 0;
      const interval = setInterval(() => {
        start++;
        setAnimatedIncidents((prev) => {
          const copy = [...prev];
          copy[idx] = start;
          return copy;
        });
        if (start >= incident.count) clearInterval(interval);
      }, 100);
    });
  }, []);

  const maxTask = Math.max(...tasks.map((t) => t.count));
  const maxIncident = Math.max(...incidents.map((i) => i.count));

  const handleNotifSubmit = (e) => {
    e.preventDefault();
    if (newNotif.recipients.length === 0) {
      alert("Please select at least one recipient.");
      return;
    }
    setNotifications([
      ...notifications,
      {
        id: notifications.length + 1,
        ...newNotif,
        date: new Date().toISOString().split("T")[0],
      },
    ]);
    setNewNotif({ title: "", message: "", recipients: [] });
    setShowNotifPopup(false);
  };

  const handleRecipientChange = (recipient) => {
    setNewNotif((prev) => {
      const exists = prev.recipients.includes(recipient);
      return {
        ...prev,
        recipients: exists
          ? prev.recipients.filter((r) => r !== recipient)
          : [...prev.recipients, recipient],
      };
    });
  };

  return (
    <div className="p-10 text-white w-full space-y-10">
      {/* Event & Coordinator Info */}
      <div className="flex justify-between bg-[#1e293b] p-6 rounded-md shadow-md">
        <div>
          <h1 className="text-3xl font-bold">{eventInfo.name}</h1>
          <p className="text-gray-300">{eventInfo.location} | {eventInfo.date}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold">{coordinatorInfo.name}</h2>
          <p className="text-gray-300">{coordinatorInfo.email}</p>
        </div>
      </div>

      {/* Summary Bars */}
      <div className="grid grid-cols-2 gap-10">
        {/* Tasks */}
        <div>
          <h3 className="text-xl font-bold mb-4">Tasks</h3>
          {tasks.map((t, idx) => (
            <div key={t.status} className="mb-3">
              <div className="flex justify-between mb-1">
                <span>{t.status}</span>
                <span>{animatedTasks[idx]}</span>
              </div>
              <div className="w-full bg-white/10 h-4 rounded-full">
                <div
                  className="h-4 rounded-full"
                  style={{
                    width: `${(animatedTasks[idx] / maxTask) * 100}%`,
                    background: `linear-gradient(to right, #4ade80, #22d3ee)`,
                    transition: "width 0.3s",
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Incidents */}
        <div>
          <h3 className="text-xl font-bold mb-4">Incidents</h3>
          {incidents.map((i, idx) => (
            <div key={i.status} className="mb-3">
              <div className="flex justify-between mb-1">
                <span>{i.status}</span>
                <span>{animatedIncidents[idx]}</span>
              </div>
              <div className="w-full bg-white/10 h-4 rounded-full">
                <div
                  className="h-4 rounded-full"
                  style={{
                    width: `${(animatedIncidents[idx] / maxIncident) * 100}%`,
                    background: `linear-gradient(to right, #facc15, #f472b6)`,
                    transition: "width 0.3s",
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agenda */}
      <div className="bg-[#1e293b] p-6 rounded-md shadow-md">
        <h3 className="text-xl font-bold mb-3">Agenda</h3>
        <ul className="list-disc list-inside text-gray-300">
          <li>09:00 AM - Registration</li>
          <li>10:00 AM - Keynote Speech</li>
          <li>11:00 AM - Workshop 1</li>
          <li>12:30 PM - Lunch Break</li>
          <li>01:30 PM - Workshop 2</li>
          <li>03:00 PM - Panel Discussion</li>
          <li>05:00 PM - Closing Ceremony</li>
        </ul>
      </div>

      {/* Notifications */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Sent Notifications</h3>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
            onClick={() => setShowNotifPopup(true)}
          >
            <Bell size={18} /> Create Notification
          </button>
        </div>
        {notifications.length === 0 && <p className="text-gray-400">No notifications sent yet.</p>}
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id} className="bg-white/10 p-3 rounded-md flex justify-between">
              <div>
                <h4 className="font-semibold">{n.title}</h4>
                <p className="text-gray-300">{n.message}</p>
                <p className="text-gray-400 text-sm">Recipients: {n.recipients.join(", ")}</p>
              </div>
              <span className="text-gray-400">{n.date}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Notification Popup */}
      {showNotifPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#0f172a] p-6 rounded-md w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create Notification</h3>
              <X className="cursor-pointer" onClick={() => setShowNotifPopup(false)} />
            </div>
            <form onSubmit={handleNotifSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Title"
                value={newNotif.title}
                onChange={(e) => setNewNotif({ ...newNotif, title: e.target.value })}
                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                required
              />
              <textarea
                placeholder="Message"
                value={newNotif.message}
                onChange={(e) => setNewNotif({ ...newNotif, message: e.target.value })}
                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                rows={4}
                required
              />
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={newNotif.recipients.includes("Organizers")}
                    onChange={() => handleRecipientChange("Organizers")}
                    className="accent-blue-500"
                  />
                  Organizers
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={newNotif.recipients.includes("Attendees")}
                    onChange={() => handleRecipientChange("Attendees")}
                    className="accent-blue-500"
                  />
                  Attendees
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={newNotif.recipients.includes("Staff")}
                    onChange={() => handleRecipientChange("Staff")}
                    className="accent-blue-500"
                  />
                  Staff
                </label>
              </div>
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 p-2 rounded text-white font-semibold"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinatorOverview;
