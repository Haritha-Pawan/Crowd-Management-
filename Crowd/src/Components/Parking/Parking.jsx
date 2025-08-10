import { Car, Map } from "lucide-react";
import React from "react";


const Parking = () => {
  const parkingDetails = [
    {
      id: 1,
      name: "Spot 1",
      status: "available",
      zone: "Zone A - Main Entrance",
      price: "Rs:300.00",
      distance: "50m",
      type: "Standard",
      features: ["Covered"],
    },

    {
      id: 2,
      name: "Spot 2",
      status: "occupied",
      zone: "Zone B - East Wing",
      price: "Rs:250.00",
      distance: "100m",
      type: "Compact",
      features: ["Valet"],
    },
    
    {
      id: 3,
      name: "Spot 3",
      status: "available",
      zone: "Zone C - South Wing",
      price: "Rs:350.00",
      distance: "30m",
      type: "Premium",
      features: ["Covered"],
    },
    {
      id: 4,
      name: "Spot 4",
      status: "occupied",
      zone: "Zone A - Main Entrance",
      price: "Rs:300.00",
      distance: "40m",
      type: "Standard",
      features: ["Covered"],
    },
    {
      id: 5,
      name: "Spot 5",
      status: "available",
      zone: "Zone D - Rooftop",
      price: "Rs:200.00",
      distance: "120m",
      type: "Compact",
      features: ["Valet"],
    },
    {
      id: 6,
      name: "Spot 6",
      status: "occupied",
      zone: "Zone E - Basement",
      price: "Rs:280.00",
      distance: "70m",
      type: "Standard",
      features: ["Covered"],
    },
    {
      id: 7,
      name: "Spot 7",
      status: "available",
      zone: "Zone F - Garden Side",
      price: "Rs:400.00",
      distance: "20m",
      type: "VIP",
      features: ["Covered"],
    },
    {
      id: 8,
      name: "Spot 8",
      status: "available",
      zone: "Zone G - West Corner",
      price: "Rs:220.00",
      distance: "90m",
      type: "Standard",
      features: ["Valet"],
    },
  ];

  return (
    <div className="h-auto flex bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 ">

      
      <div className="box p-10 mt-20 w-full">

               
                
         
        <div className="text-white text-4xl font-bold">Smart Parking System</div>
        
        <div className="text-(--color-secondary)">
          Real-time parking availability and reservation system
        </div>

        <div className="grid xl:grid-cols-3 max-sm:grid-cols-1 gap-10 mt-10">
          <div className="bg-white/5 p-3 text-(--color-secondary) rounded-md border border-white/10 shadow-md">
            Available Spot
            <div className="text-[#4ade80] text-4xl font-bold flex justify-between">
              7
              <Car size={54} color="#4ade80" className="relative bottom-5" />
            </div>
          </div>

          <div className="bg-white/5 p-3 text-(--color-secondary) rounded-md border border-white/10 shadow-md">
            Occupied Spot
            <div className="text-[#f87171] text-4xl font-bold flex justify-between">
              2
              <Car size={54} color="#f87171" className="relative bottom-5" />
            </div>
          </div>

          <div className="bg-white/5 p-3 text-(--color-secondary) rounded-md border border-white/10 shadow-md">
            Available Spot
            <div className="text-[#4ade80] text-4xl font-bold flex justify-between">
              7
              <Car size={54} color="#4ade80" className="relative bottom-5" />
            </div>
          </div>
        </div>

        {/*  Parking Spot area */}

        <div className="spot grid 2xl:grid-cols-4 xl:grid-cols-3 max-sm:grid-cols-1 gap-10">
          {parkingDetails.map((spot, index) => (
            <div
              key={index}
              className="spot-Area  bg-white/5  p-3 text-(--color-secondary) rounded-md border border-white/10  mt-10 backdrop-blur-md"
            >
              <div className="spot-Name text-white font-bold flex  justify-between text-xl mb-1">
                Spot {spot.name}
                <div
                  className={`availability ${
                    spot.status === "available"
                      ? "border border-green-500/20  p-1 rounded-full text-xs px-2 text-green-400"
                      : "bg-red-500/20 border border-red-800/20 p-1 rounded-full text-xs px-2 text-red-500"
                  }  `}
                >
                  {spot.status}
                </div>
              </div>

              <div className="zone text-(--color-secondary) text-x">
                {spot.zone}
              </div>

              <div className="details mt-5">
                <div className="price flex justify-between mb-5">
                  Price per Hour
                  <div className="price text-white font-bold">{spot.price}</div>
                </div>

                <div className="Distance flex justify-between mb-5">
                  Distance
                  <div className="Distance text-white font-bold">
                    {spot.distance}
                  </div>
                </div>

                <div className="Distance flex justify-between mb-5">
                  Type
                  <div className="Type text-white font-bold">{spot.type}</div>
                </div>

                <div className="features-container mb-5">
                  Features

   

                 {spot.features.map((feature,index)=>(
                  <div key={index} className="Type flex  gap-3 mt-2 ">
                    <div className="features bg-white text-black px-5 gap-5 rounded-full font-semibold">
                      {spot.features}
                    </div>
                  </div>
                 ))}

               
                </div>

                <div className="btn flex justify-center gap-5">
                  <div className="bg-white/10 px-10 border border-white/10 p-2 rounded-md cursor-pointer text-center  font-bold text-black">
                    Navigate{" "}
                  </div>
                  <div className="bg-white/10 px-10 border border-white/10 p-2 rounded-md cursor-pointer text-center  text-white font-bold bg-gradient-to-r from-blue-500 to-purple-600">
                    Reserve
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Parking;
