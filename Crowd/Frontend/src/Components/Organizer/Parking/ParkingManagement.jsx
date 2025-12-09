import {
  Car,
  ChartNoAxesCombined,
  CircleDotIcon,
  Edit,
  Locate,          // ⬅️ use this instead of LocationEdit
  Search,
  Trash2Icon,
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import ReservationTable from "./ReservationTable";
import AddForm from "./AddForm";
import RealTime from "./RealTime";
import axios from "axios";
import { toast } from "react-hot-toast";
import EditForm from "./EditForm";

const API = "https://crowd-management-93xw.vercel.app/";

const ParkingManagement = () => {
  const [isAddPopupOpen, setAddIsPopupOpen] = useState(false);
  const [isEditPopupOpen, setEditIsPopupOpen] = useState(false);
  const [active, setActive] = useState("Parking Zones");
  const [places, setPlaces] = useState([]); // unified: places
  const [selectedId, setSelectedId] = useState(null);

  const buttons = ["Parking Zones", "Reservation", "Real-time View"];

  // ---- single fetcher for /api/zone ----
  const fetchPlaces = async () => {
    try {
      const res = await axios.get(`https://crowd-management-93xw.vercel.app/api/zone`);
      console.log("[PM] GET /zone:", res.data);
      const list = res?.data?.data ?? res?.data ?? [];
      if (Array.isArray(list)) setPlaces(list);
      else {
        console.error("[PM] Unexpected shape for /zone:", res.data);
        toast.error("Invalid places response");
      }
      if (res?.data?.error) toast.error(res.data.error);
    } catch (error) {
      console.error("[PM] Fetch places failed:", error);
      toast.error("Failed to fetch places");
    }
  };

  // 🔹 NEW: GET /api/spots/metrics and merge into `places`
  const fetchAndMergeMetrics = async () => {
    try {
      const { data } = await axios.get(`${API}/spots/metrics`);
      const byZone = Array.isArray(data?.byZone) ? data.byZone : [];

      // zoneId -> { capacity, occupied, available }
      const map = new Map();
      for (const z of byZone) map.set(String(z.zoneId), z);

      // merge into places (capacity/occupied only; UI derives available)
      setPlaces((prev) =>
        Array.isArray(prev)
          ? prev.map((p) => {
              const m = map.get(String(p._id));
              if (!m) return p;
              return {
                ...p,
                capacity: m.capacity ?? p.capacity ?? 0,
                occupied: m.occupied ?? p.occupied ?? 0,
                // optional: keep if you ever need it
                availableFromMetrics: m.available,
              };
            })
          : prev
      );
    } catch (e) {
      console.error("[PM] Fetch metrics failed:", e);
      toast.error(e?.response?.data?.error || "Failed to fetch parking metrics");
    }
  };

  // initial load
  useEffect(() => {
    (async () => {
      await fetchPlaces();           // get zones first
      await fetchAndMergeMetrics();  // then enrich with live metrics
    })();
  }, []);

  // ---- totals / cards (no UI change) ----
  const totalCapacity = useMemo(
    () => places.reduce((t, z) => t + (Number(z?.capacity) || 0), 0),
    [places]
  );
  const totalOccupied = useMemo(
    () => places.reduce((t, z) => t + (Number(z?.occupied) || 0), 0),
    [places]
  );
  const totalAvailable = Math.max(0, totalCapacity - totalOccupied);
  const occupancyRate = totalCapacity
    ? Math.round((totalOccupied / totalCapacity) * 100) + "%"
    : "0%";

  const card = [
    { title: "Total Capacity", icon: <Car color="#2f80ed" size={30} />, count: totalCapacity },
    { title: "Total Occupied", icon: <CircleDotIcon color="#FF3535" size={30} />, count: totalOccupied },
    { title: "Available", icon: <CircleDotIcon color="#4ade80" size={30} />, count: totalAvailable },
    { title: "Occupancy Rate", icon: <ChartNoAxesCombined color="#facc15" size={30} />, count: occupancyRate },
  ];

  // ---- delete: keep it consistent with places API ----
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this place?")) return;
    try {
      const res = await axios.delete(`${API}/zone/${id}`);
      console.log("[PM] DELETE /zone/:id:", res.data);

      toast.success(res?.data?.message ?? "Place deleted");
      setPlaces((prev) => prev.filter((z) => z._id !== id));
      // refresh metrics after deletion so totals/tiles stay correct
      await fetchAndMergeMetrics();
    } catch (err) {
      console.error("[PM] Delete failed:", err);
      toast.error("Failed to delete place");
    }
  };

  return (
    <div className="p-10 h-auto w-full">
      <div className="header text-white text-3xl font-bold">Parking Management</div>
      <div className="sub-heading text-gray-300 text-xl ">
        Manage parking places and reservations
      </div>

      <div className="flex gap-6 mt-6 justify-end">
        {buttons.map((btn) => (
          <button
            key={btn}
            onClick={() => setActive(btn)}
            className={`px-4 py-2 rounded-md font-semibold ${
              active === btn ? "bg-blue-600 text-white" : "bg-white/10 text-gray-300"
            }`}
          >
            {btn}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {active === "Parking Zones" && (
          <>
            {/* Card Stats */}
            <div className="card grid 2xl:grid-cols-4 lg:grid-cols-4 mt-8 md:grid-cols-2 gap-3 mx-auto">
              {card.map((data, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 2xl:w-98 2xl:h-30 lg:w-58 md:w-76 text-white rounded-md p-5"
                >
                  <div className="icon flex justify-between">
                    <div className="title text-[18px]">{data.title}</div>
                    <div className="icon relative top-5">{data.icon}</div>
                  </div>
                  <div className="count text-2xl mt-1 font-bold">{data.count}</div>
                </div>
              ))}
            </div>

            {/* Add Place Button */}
            <button
              onClick={() => setAddIsPopupOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 px-10 cursor-pointer font-medium mt-5 absolute right-22 rounded-md hover:opacity-70 text-white"
            >
              + Add Place
            </button>

            {/* Forms */}
            <AddForm
              isOpen={isAddPopupOpen}
              onClose={() => setAddIsPopupOpen(false)}
              refresh={async () => {
                await fetchPlaces();
                await fetchAndMergeMetrics(); // keep metrics in sync after add
              }}
            />

            <EditForm
              isOpen={isEditPopupOpen}
              onClose={() => setEditIsPopupOpen(false)}
              id={selectedId}
              refresh={async () => {
                await fetchPlaces();
                await fetchAndMergeMetrics(); // keep metrics in sync after edit
              }}
            />

            {/* Places List */}
            <div className="parking-slots mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10">
              {Array.isArray(places) && places.length > 0 ? (
                places.map((place) => {
                  const capacity = Number(place.capacity) || 0;
                  const occupied = Number(place.occupied) || 0;
                  const available = Math.max(0, capacity - occupied);
                  const percent = capacity ? Math.min(100, Math.round((occupied / capacity) * 100)) : 0;

                  return (
                    <div
                      key={place._id}
                      className="p-5 bg-white/5 rounded-md border border-white/10 text-white text-2xl font-medium"
                    >
                      <div className="title flex items-center justify-between">
                        {place.name}
                        <div
                          className={`text-xs font-bold rounded-full w-20 px-2 flex justify-center items-center h-5 border
                          ${
                            place.status === "active"
                              ? "bg-green-500/20 text-green-500 border-green-500/20"
                              : "bg-red-500/20 text-red-500 border-red-500/20"
                          }`}
                        >
                          {place.status}
                        </div>
                      </div>

                      <div className="sub-heading flex mt-2 text-gray-300 items-center text-sm">
                        <Locate size={20} />
                        <div className="ml-2">{place.location}</div>
                      </div>

                      <div className="text-sm mt-6 text-gray-300 flex gap-3 justify-between">
                        Occupancy
                        <div>
                          {occupied} / {capacity}
                        </div>
                      </div>

                      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-black/40">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="text-sm mt-2 text-gray-300 font-normal">
                        Available Slots:{" "}
                        <span className="text-green-400 font-bold ">{available}</span>
                        <span className=" ml-6 font-bold ">Rate: {place.price}</span>
                      </div>

                      <div className="text-sm mt-2 text-gray-300 font-normal">
                        Facilities:
                        <div>
                          {place.facilities && place.facilities.length > 0 ? (
                            place.facilities.map((facility, index) => (
                              <span
                                key={index}
                                className="inline-block bg-white/15 text-xs border border-white/5 shadow-md mt-2 text-gray-200 px-2 py-1 rounded-full mr-2 mb-2"
                              >
                                {facility}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500">No facilities listed</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="btn mt-4 flex gap-4">
                        <button className="flex items-center border border-white/10 px-4 py-1 bg-white/5 rounded-md text-white text-sm">
                          <Locate size={15} className="mr-2" />
                          Details
                        </button>
                        <button
                          onClick={() => {
                            console.log("[PM] Edit clicked id:", place._id);
                            setSelectedId(place._id);
                            setEditIsPopupOpen(true);
                          }}
                          className="flex items-center border border-white/10 px-4 py-1 bg-white/5 rounded-md text-white text-sm"
                        >
                          <Edit size={15} className="mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(place._id)}
                          className="flex items-center border border-white/10 px-4 py-1 bg-white/5 cursor-pointer rounded-md text-red-400 text-sm"
                        >
                          <Trash2Icon size={15} className="mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-400">No places available.</div>
              )}
            </div>
          </>
        )}

        {active === "Reservation" && (
          <div className="mt-10">
            <ReservationTable />
          </div>
        )}

        {active === "Real-time View" && (
          <div className="mt-10">
            <RealTime />
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingManagement;
