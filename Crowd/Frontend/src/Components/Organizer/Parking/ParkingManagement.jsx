import {
  Car,
  ChartNoAxesCombined,
  CircleDotIcon,
  Edit,
  Locate,
  LocationEdit,
  Trash2Icon,
} from "lucide-react";
import React, { useState, useEffect ,useMemo} from "react";
import ReservationTable from "./ReservationTable";
import AddForm from "./AddForm";
import RealTime from "./RealTime";
import axios from "axios";
import { toast } from "react-hot-toast";
import EditForm from "./EditForm";

const ParkingManagement = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [active, setActive] = useState("Parking Zones");
  const [parkingZones, setParkingZones] = useState([]); // Store fetched parking zones
  const [selectedZoneId, setSelectedZoneId] = useState(null);


  const buttons = ["Parking Zones", "Reservation", "Real-time View"];


  //total parkingslot

const totalCapacity = useMemo(() => {
  if (!Array.isArray(parkingZones)) return 0;
  return parkingZones.reduce((total, zone) => {
    return total + (zone?.capacity || 0);
  }, 0);
}, [parkingZones]);





  const card = [
    {
      title: "Total Counters",
      icon: <Car color="#2f80ed" size={30} />,
      count:totalCapacity,
    },
    {
      title: "Total Occupied",
      icon: <CircleDotIcon color="#FF3535" size={30} />,
      count: "460",
    },
    {
      title: "Available",
      icon: <CircleDotIcon color="#4ade80" size={30} />,
      count: "170",
    },
    {
      title: "Occupancy Rate",
      icon: <ChartNoAxesCombined color="#facc15" size={30} />,
      count: "73%",
    },
  ];

  

 
  useEffect(() => {
    const fetchParkingZones = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/parking-zone");
        console.log("API Response:", res.data); 
       
        if (Array.isArray(res.data)) {
          setParkingZones(res.data); 
        } else {
          console.error("Error: Response data is not an array");
        }
      } catch (error) {
        console.log("Error fetching parking zones", error);
      }
    };
    fetchParkingZones();
  }, []);






const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this parking zone?")) return;

  try {
    const res = await axios.delete(`http://localhost:5000/api/parking-zone/${id}`);
    
    if (res.status === 200) {
      alert(res.data.message);
      setParkingZones((prev) => prev.filter((zone) => zone._id !== id));
      toast.success("Parking zone deleted succesfuly");
    }
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Failed to delete parking zone");
  }
};


  



 
  return (
    <div className="p-10 h-auto w-full">
      <div className="header text-white text-3xl font-bold">Parking Management</div>
      <div className="sub-heading text-gray-300 text-xl">
        Manage parking zones and reservations
      </div>

      <div className="flex gap-6 mt-6 justify-end">
        {buttons.map((btn, index) => (
          <button
            key={index}
            onClick={() => setActive(btn)}
            className={`px-4 py-2 rounded-md font-semibold ${
              active === btn
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-gray-300"
            }`}
          >
            {btn}
          </button>
        ))}
      </div>

      {/* Conditional Rendering Based on Active Tab */}
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

            {/* Add Parking Button */}
            <button
              onClick={() => setIsPopupOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 px-10 cursor-pointer font-medium mt-5 absolute right-22 rounded-md hover:opacity-70 text-white"
            >
              + Add Parking Zone
            </button>

          
            <AddForm isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
              <EditForm isOpen={isPopupOpen}  onClose={()=>setIsPopupOpen(false)} zoneId={selectedZoneId} />

            {/* Parking Zones Info */}
            <div className="parking-slots mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10">

              {Array.isArray(parkingZones) && parkingZones.length > 0 ? (
                parkingZones.map((zone, idx) => {
                  const color = idx === 0 ? "bg-blue-600" : "bg-yellow-400";
                  const fill = idx === 0 ? "w-1/2" : "w-3/4";
                  const available = zone.totalCapacity - zone.occupied;

                  return (
                    <div
                      key={zone._id}
                      className="p-5 bg-white/5 rounded-md border border-white/10 text-white text-2xl font-medium"
                    >
                      <div className="title flex items-center justify-between">
                        {zone.name} 
                        <div className={` bg-green-500/20 text-green-500 text-xs font-bold rounded-full border border-green-500/20 w-20 px-2 flex justify-center items-center h-5 
                          ${zone.status === "active" ? "bg-green-500/20 text-green-500 border-green-500/20" : "bg-red-500/20 text-red-500 border-red-500/20 "}`}>
                          {zone.status}
                        </div>
                      </div>

                      <div className="sub-heading flex mt-2 text-gray-300 items-center text-sm">
                        <LocationEdit size={20} />
                        <div className="ml-2">{zone.location}</div>
                      </div>


                   
                      <div className="text-sm mt-6 text-gray-300 flex gap-3 justify-between">
                        Occupancy
                        <div>
                          {zone.occupied} / {zone.capacity} 
                          
                        </div>
                      </div>

                      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-black/40">
                        <div className={`${fill} h-full ${color} rounded-full`}></div>
                      </div>

                      <div className="text-sm mt-2 text-gray-300 font-normal">
                        Available Slot:{" "}
                        <span className="text-green-400 font-bold">{zone.capacity} Spots</span>
                      </div>

                      <div className="text-sm mt-2 text-gray-300 font-normal">
                        Facilities:{" "}
                        <div>
                           {zone.facilities && zone.facilities.length >0 ?(
                            zone.facilities.map((facility,index)=>(
                              <span key={index} className="inline-block bg-white/15 text-xs border border-white/5 shadow-md mt-2  text-gray-200 px-2 py-1 rounded-full mr-2 mb-2">{facility}</span>
                            ))
                           ):(
                            <span className="text-gray-500">No facilities listed</span>
                           )}
                        </div>
                      </div>



                      {/* Action Buttons */}
                      <div className="btn mt-4 flex gap-4">
                        <button className="flex items-center border border-white/10 px-4 py-1 bg-white/5 rounded-md text-white text-sm">
                          <Locate size={15} className="mr-2" />
                          Details
                        </button>
                        <button
                          onClick={() => {setIsPopupOpen(true); setSelectedZoneId(zone._id)}}
                        className="flex items-center border border-white/10 px-4 py-1 bg-white/5 rounded-md text-white text-sm">
                          <Edit size={15} className="mr-2" />
                          Edit
                        </button>
                        <button 
                        onClick={()=>handleDelete(zone._id)} 
                        className="flex items-center border border-white/10 px-4 py-1 bg-white/5 cursor-pointer rounded-md text-red-400 text-sm">
                          <Trash2Icon size={15} className="mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div>No parking zones available.</div>
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
