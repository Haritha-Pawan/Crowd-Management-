import {
  Car,
  ChartNoAxesCombined,
  CircleDotIcon,
  Edit,
  Locate,
  LocationEdit,
  Trash2Icon
} from 'lucide-react';
import React, { useState ,useMemo} from 'react';
import AddForm from './AddForm';

const ReservationTable = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [active, setActive] = useState('Parking Zones');
  

  const buttons = ['Parking Zones', 'Reservation', 'Real-time View'];

   const reservations = [
    {  Number: 1,
      vehicle: "Car",
      owner: "John Doe",
      zone: "Bogambara",
      spot: "B-001",
      time: "10:30 AM",
      duration: "2h",
      amount: "$5.00",
      status: "Occupied", },
  ,
  ];

 
  

  const card = [
    { title: 'Total Counters', icon: <Car color='#2f80ed' size={30} />, count: '66' },
    { title: 'Total Occupied', icon: <CircleDotIcon color='#FF3535' size={30} />, count: '460' },
    { title: 'Available', icon: <CircleDotIcon color='#4ade80' size={30} />, count: '170' },
    { title: 'Occupancy Rate', icon: <ChartNoAxesCombined color='#facc15' size={30} />, count: '73%' }
  ];

  return (
    <div className=''>
      {/* Conditional Rendering Based on Active Tab */}
      <div className=''>
        {active === 'Parking Zones' && (
          <>
            {/* Card Stats */}
            <div className='card grid 2xl:grid-cols-4 lg:grid-cols-4  md:grid-cols-2 gap-3 mx-auto'>
              {card.map((data, index) => (
                <div
                  key={index}
                  className='bg-white/5 border border-white/10 2xl:w-98 2xl:h-30 lg:w-58 md:w-76 text-white rounded-md p-5'
                >
                  <div className='icon flex justify-between'>
                    <div className='title text-[18px]'>{data.title}</div>
                    <div className='icon relative top-5'>{data.icon}</div>
                  </div>
                  <div className='count text-2xl mt-1 font-bold'>{data.count}</div>
                </div>
              ))}
            </div>

          

         

           
            
          </>
        )}

        {active === 'Reservation' && (
          <div className='mt-10'>
            <ReservationTable />
          </div>
        )}

        {active === 'Real-time View' && (
          <div className='text-white mt-10 text-xl'>Real-time view coming soon...</div>
        )}

          <div className='mt-10 p-5 bg-white/5 border border-white/10 rounded-md'>
                     <div className='text-white text-3xl font-bold'>Parking Reservations (0)</div>

                     <table className="mt-5 w-full border border-white/10 text-white rounded-lg">
        <thead className=" text-left border-b border-white/10 text-gray-300">
          <tr>
            <th className="px-4 py-2">Vehicle</th>
            <th className="px-4 py-2">Owner</th>
            <th className="px-4 py-2">Zone</th>
            <th className="px-4 py-2">Spot</th>
            <th className="px-4 py-2">Time</th>
            <th className="px-4 py-2">Duration</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr
              key={r.id}
              className="border-t border-white/10 hover:bg-white/5"
            >
              <td className="px-4 py-2">{r.Number}</td>
              <td className="px-4 py-2">{r.owner}</td>
              <td className="px-4 py-2">{r.zone}</td>
              <td className="px-4 py-2">{r.spot}</td>
              <td className="px-4 py-2">{r.time}</td>
              <td className="px-4 py-2">{r.duration}</td>
              <td className="px-4 py-2">{r.amount}</td>
            
              
              <td
                className={`px-4 py-2 font-semibold ${
                  r.status === "Occupied"
                    ? "text-red-400"
                    : r.status === "Reserved"
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {r.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
            </div>


        
      </div>
    </div>

    
  );
};

export default ReservationTable;
