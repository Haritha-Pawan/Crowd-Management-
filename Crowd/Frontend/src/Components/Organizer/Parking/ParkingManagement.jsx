import {
  Car,
  ChartNoAxesCombined,
  CircleDotIcon,
  Edit,
  Locate,
  LocationEdit,
  Trash2Icon
} from 'lucide-react';
import React, { useState } from 'react';
import ReservationTable from './ReservationTable';
import AddForm from './AddForm';
import RealTime from './RealTime';


const ParkingManagement = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [active, setActive] = useState('Parking Zones');

  const buttons = ['Parking Zones', 'Reservation', 'Real-time View'];

  const card = [
    { title: 'Total Counters', icon: <Car color='#2f80ed' size={30} />, count: '630' },
    { title: 'Total Occupied', icon: <CircleDotIcon color='#FF3535' size={30} />, count: '460' },
    { title: 'Available', icon: <CircleDotIcon color='#4ade80' size={30} />, count: '170' },
    { title: 'Occupancy Rate', icon: <ChartNoAxesCombined color='#facc15' size={30} />, count: '73%' }
  ];

  return (


    <div className='p-10 h-auto w-full'>
      <div className='header text-white text-3xl font-bold'>Parking Management</div>
      <div className='sub-heading text-gray-300 text-xl'>Manage parking zones and reservations</div>

      {/* Toggle Buttons */}
      <div className='flex gap-6 mt-6 justify-end'>
        {buttons.map((btn, index) => (
          <button
            key={index}
            onClick={() => setActive(btn)}
            className={`px-4 py-2 rounded-md font-semibold ${
              active === btn ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-300'
            }`}
          >
            {btn}
          </button>
        ))}
      </div>

      {/* Conditional Rendering Based on Active Tab */}
      <div className='mt-10'>
        {active === 'Parking Zones' && (
          <>
            {/* Card Stats */}
            <div className='card grid 2xl:grid-cols-4 lg:grid-cols-4 mt-8 md:grid-cols-2 gap-3 mx-auto'>
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

            {/* Add Parking Button */}
            <button
              onClick={() => setIsPopupOpen(true)}
              className='bg-gradient-to-r from-blue-500 to-purple-600 p-2 px-10 cursor-pointer font-medium mt-5 absolute right-22 rounded-md hover:opacity-70 text-white'
            >
              + Add Parking Zone
            </button>

            {/* AddForm */}
            <AddForm isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />

            {/* Parking Zones Info */}
            <div className='parking-slots mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10'>
              {[150, 100].map((occupancy, idx) => {
                const zone = idx === 0 ? 'Zone A' : 'Zone B';
                const color = idx === 0 ? 'bg-blue-600' : 'bg-yellow-400';
                const fill = idx === 0 ? 'w-1/2' : 'w-3/4';
                const available = 200 - occupancy;

                return (
                  <div
                    key={idx}
                    className='p-5 bg-white/5 rounded-md border border-white/10 text-white text-2xl font-medium'
                  >
                    <div className='title flex items-center justify-between'>
                      {zone} - Main Parking
                      <div className='bg-green-500/20 text-green-500 text-xs rounded-full border border-green-500/20 w-20 px-2 flex justify-center items-center h-5'>
                        Active
                      </div>
                    </div>

                    <div className='sub-heading flex mt-2 text-gray-300 items-center text-sm'>
                      <LocationEdit size={20} />
                      <div className='ml-2'>Main Entrance Area</div>
                    </div>

                    <div className='text-sm mt-6 text-gray-300 flex gap-3'>
                      Occupancy
                      <div>
                        {occupancy} / 200 ({Math.round((occupancy / 200) * 100)}%)
                      </div>
                    </div>

                    <div className='mt-3 h-2.5 w-full overflow-hidden rounded-full bg-black/40'>
                      <div className={`${fill} h-full ${color} rounded-full`}></div>
                    </div>

                    <div className='text-sm mt-2 text-gray-300 font-normal'>
                      Available Slot:{' '}
                      <span className='text-green-400 font-bold'>{available} Spots</span>
                    </div>

                    {/* Action Buttons */}
                    <div className='btn mt-4 flex gap-4'>
                      <button className='flex items-center border border-white/10 px-4 py-1 bg-white/5 rounded-md text-white text-sm'>
                        <Locate size={15} className='mr-2' />
                        Details
                      </button>
                      <button className='flex items-center border border-white/10 px-4 py-1 bg-white/5 rounded-md text-white text-sm'>
                        <Edit size={15} className='mr-2' />
                        Edit
                      </button>
                      <button className='flex items-center border border-white/10 px-4 py-1 bg-white/5 rounded-md text-red-400 text-sm'>
                        <Trash2Icon size={15} className='mr-2' />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            
          </>
        )}

        {active === 'Reservation' && (
          <div className='mt-10'>
            <ReservationTable />
          </div>
        )}

        {active === 'Real-time View' && (
          <div className=' mt-10'>
            <RealTime/>
          </div>
        )}
      </div>
    </div>

   

   
  );
};

export default ParkingManagement;
