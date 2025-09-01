import {
  Car,
  ChartNoAxesCombined,
  CircleDotIcon,
  Edit,
  Locate,
  LocationEdit,
  Trash2Icon,
} from "lucide-react";
import React, { useState } from "react";
import AddForm from "./AddForm";

const RealTime = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [active, setActive] = useState("Parking Zones");

  const buttons = ["Parking Zones", "Reservation", "Real-time View"];

    const parkingDetails = [
    {
      id: 1,
      name: "Spot 1",
      status: "Reserved",
      zone: "Zone A - Main Entrance",
      price: "Rs:300.00",
      distance: "50m",
      type: "Standard",
      features: ["Covered"],
    },

     {
      id: 2,
      name: "Spot 1",
      status: "occupied",
      zone: "Zone A - Main Entrance",
      price: "Rs:300.00",
      distance: "50m",
      type: "Standard",
      features: ["Covered"],
    },

       {
      id: 2,
      name: "Spot 1",
      status: "available",
      zone: "Zone A - Main Entrance",
      price: "Rs:300.00",
      distance: "50m",
      type: "Standard",
      features: ["Covered"],
    },
  ];

  const card = [
    {
      title: "Total Counters",
      icon: <Car color="#2f80ed" size={30} />,
      count: "630",
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

  return (
    <div className="">
      {/* Conditional Rendering Based on Active Tab */}
      <div className="">
        {active === "Parking Zones" && (
          <>
            {/* Card Stats */}
            <div className="card grid 2xl:grid-cols-4 lg:grid-cols-4  md:grid-cols-2 gap-3 mx-auto">
              {card.map((data, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 2xl:w-98 2xl:h-30 lg:w-58 md:w-76 text-white rounded-md p-5"
                >
                  <div className="icon flex justify-between">
                    <div className="title text-[18px]">{data.title}</div>
                    <div className="icon relative top-5">{data.icon}</div>
                  </div>
                  <div className="count text-2xl mt-1 font-bold">
                    {data.count}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-5 bg-white/5 border border-white/10 rounded-md">
              <div className="text-white text-3xl font-bold ">
                Real-time Parking Status
              </div>
                     

                     <div>
                        

                            
        <div className="spot grid 2xl:grid-cols-4 xl:grid-cols-4 max-sm:grid-cols-1 gap-10">
          {parkingDetails.map((spot, index) => (
            <div
              key={index}
              className={`availability ${spot.status === "available" ? "bg-green-500/15 ":spot.status ==="Reserved" ? "bg-yellow-500/10 ": "bg-red-500/15"} spot-Area   p-3 text-(--color-secondary) rounded-md border border-white/10  mt-10 backdrop-blur-md`}
            >
              <div className="spot-Name text-white font-bold flex  justify-between text-[14px] mb-1">
                Spot {spot.name}
                <div
                  className={`availability ${
                    spot.status === "available"
                      ? "border border-green-500/20 bg-green-500/20 p-1 rounded-full text-xs px-2 text-green-400" : spot.status ==="Reserved" ? "border border-yellow-500/20 bg-yellow-500/20 p-1 rounded-full text-xs px-2 text-yellow-400 "
                      : "bg-red-500/20 border border-red-800/20 p-1 rounded-full text-xs px-2 text-red-500"
                  }  `}
                >
                  {spot.status}
                </div>
              </div>

              <div className="zone text-(--color-secondary) text-[13px]">
                {spot.zone}
              </div>

              <div className="details mt-5">
                <div className="price flex justify-between mb-4 text-[13px]">
                  Price per Hour
                  <div className="price text-white ">{spot.price}</div>
                </div>

                <div className="Distance flex justify-between mb-4 text-[13px]">
                  Distance
                  <div className="Distance text-white ">
                    {spot.distance}
                  </div>
                </div>

                <div className="Distance flex justify-between mb-4 text-[13px]">
                  Type
                  <div className="Type text-white">{spot.type}</div>
                </div>

                <div className="features-container mb-5">
                  Features

   

                 {spot.features.map((feature,index)=>(
                  <div key={index} className="Type flex  gap-3 mt-2 ">
                    <div className="features bg-white/10 px-2 border-white/5 text-gray-300 text-xs  gap-5 rounded-full font-semibold">
                      {spot.features}
                    </div>
                  </div>
                 ))}

               
                </div>

            
              </div>
            </div>
          ))}
        </div>

                        
                     </div>
                 
            </div>
          </>
        )}

        {active === "Reservation" && (
          <div className="mt-10">
            <ReservationTable />
          </div>
        )}

        {active === "Real-time View" && (
          <div className="text-white mt-10 text-xl"></div>
        )}
      </div>
    </div>
  );
};

export default RealTime;
