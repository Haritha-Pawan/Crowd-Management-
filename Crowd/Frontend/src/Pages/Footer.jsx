import React from 'react';
import facebook from '../assets/images/facebook.png';
import twitter from '../assets/images/twitter.png';
import instagram from '../assets/images/insta2.png';
import gmail from '../assets/images/gm.png';
import logo from '../assets/images/logo.jpg';

function Footer() {
  return (
    <footer className="bg-[#111B44] text-white py-10 px-6 mt-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Logo & Description */}
        <div>
          <h1 className="text-2xl font-bold mb-4">
            <span className="text-orange-400">Crowd</span>Flow
          </h1>
          <img src={logo} className='w-16 h-12 rounded-md mb-4'/>
          <p className="text-sm text-gray-300 opacity-70">
            Delivering real-time insights while maintaining privacy and full GDPR compliance. 
            Trusted by organizations for smart visitor analytics.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-orange-400">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="/" className="hover:text-orange-400">Home</a></li>
            <li><a href="/events" className="hover:text-orange-400">Event</a></li>
            <li><a href="/services" className="hover:text-orange-400">Service</a></li>
            <li><a href="/contact" className="hover:text-orange-400">Contact Us</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-orange-400">Contact</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>Email: info@crowdflow.com</li>
            <li>Phone: +1 234 567 890</li>
            <li>Address: 1234 Insight Lane, Smart City</li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-orange-400">Follow Us</h3>
          <div className="flex gap-4 items-center">
            <a href="#" 
               className="bg-white w-10 h-10 rounded-md flex items-center justify-center">
              <img src={facebook} alt="Facebook" className="w-6 h-6"/>
            </a>
            <a href="#"  
               className="bg-white w-10 h-10 rounded-md flex items-center justify-center">
              <img src={instagram} alt="Instagram" className="w-6 h-6"/>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" 
               className="bg-white w-10 h-10 rounded-md flex items-center justify-center">
              <img src={twitter} alt="Twitter" className="w-6 h-6"/>
            </a>
            <a href="#" 
               className="bg-white w-10 h-10 rounded-md flex items-center justify-center">
              <img src={gmail} alt="Gmail" className="w-6 h-6"/>
            </a>
          </div>
        </div>
      </div>

      {/* Policies Links */}
      <div className="mt-10 flex flex-wrap px-22 gap-6 text-sm text-gray-300">
        <a href="/terms" className="hover:text-orange-400">Terms & Conditions</a>
        <a href="/privacy" className="hover:text-orange-400">Privacy Policy</a>
        <a href="/cookies" className="hover:text-orange-400">Cookies Policy</a>
        <a href="/copyrights" className="hover:text-orange-400">Copyright Notification</a>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700 mt-5 pt-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} CrowdFlow. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
