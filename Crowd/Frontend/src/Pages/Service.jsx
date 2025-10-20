import React from 'react';
import icon1 from '../assets/images/event access.jpg'; // Replace with actual icons
import icon2 from '../assets/images/qr1.jpg';
import icon3 from '../assets/images/parking.jpg';
import icon4 from '../assets/images/lost items.jpg';

function Service() {
  const services = [
    {
      title: 'Seamless Access for event',
      icon: icon1,
      desc: 'Generate unique entry QR codes instantly for attendees, enabling quick and secure check-ins without delays.',
    },
    {
      title: 'Fast QR checking',
      icon: icon2,
      desc: 'Generate unique entry QR codes instantly for attendees, enabling quick and secure check-ins without delays.',
    },
    {
      title: 'Live parking Info',
      icon: icon3,
      desc: 'Monitor available parking spaces in real time, guiding visitors to free slots and reducing congestion.',
    },
    {
      title: 'Lost & Found Help',
      icon: icon4,
      desc: 'Report lost or found items instantly, making it easier for attendees to reconnect with their belongings.',
    },
  ];

  return (
    <div className="py-5 px-4 md:px-20 text-center bg-white text-black">
      {/* Section Heading */}
      <h1 className="text-4xl font-bold mb-2">
        <span className="text-orange-500">Our </span>
        <span className="text-black">Benefits</span>
      </h1>
      <p className="text-gray-500 mb-8">
        we promise users with the standard of these 4 services
      </p>

      {/* Service Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {services.map((item, index) => (
          <div key={index} className="flex flex-col items-center text-center px-4">
            <img src={item.icon} alt={item.title} className="h-28 w-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Service;
