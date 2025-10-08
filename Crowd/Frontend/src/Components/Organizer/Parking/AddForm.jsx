import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const FACILITY_OPTIONS = [
  "EV charging", "CCTV", "Handicap accessible", "Covered",
  "24/7 access", "Security personnel", "Restrooms",
];

const AddForm = ({ isOpen, onClose, OnCreated, refresh }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    type: "Standard",
    status: "active",
    price: "",         
    distance: "", 
    description:"",      
    facilities: [],
  });

  const handlechange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const toggleFacility = (label) => {
    setFormData((p) => ({
      ...p,
      facilities: p.facilities.includes(label)
        ? p.facilities.filter((f) => f !== label)
        : [...p.facilities, label],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Transform the form data to match the backend API structure
      const placeData = {
        name: formData.name,
        code: formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'), // Generate code from name
        capacity: parseInt(formData.capacity),
        location: formData.location,
        type: formData.type,
        status: formData.status,
        price: parseFloat(formData.price),
        distance: formData.distance,
        description: formData.description,
        facilities: formData.facilities,
        coordinates: {
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined
        }
      };

      const response = await axios.post("http://localhost:5000/api/zone", placeData);
      
      if (response.data.data) {
        OnCreated?.(response.data.data);       
        toast.success("Parking place created successfully");
        refresh?.();
        onClose();
      } else {
        throw new Error(response.data.error || "Failed to create parking place");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "There was an error creating the parking place");
    }
  };

  return (
    
    <div className=" fixed inset-0 z-50 bg-black/60 overflow-y-auto">
      <div className="flex min-h-full items-start justify-center p-4 sm:p-6 md:p-8 ">

        <div className="w-full max-w-3xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl">
         
          <div className="px-6 pt-6">
            <h2 className="text-white font-bold text-xl">Add New Parking Zone</h2>
            <p className="text-gray-300 font-medium text-xs mb-4">
              Create a new parking zone for the event
            </p>
          </div>

         
          <form onSubmit={handleSubmit} className="px-6 pb-6">
           
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="block text-white text-sm font-semibold">Zone Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handlechange}
                  type="text"
                  placeholder="Zone A - Main Parking"
                  className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold">Location</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handlechange}
                  type="text"
                  placeholder="Main Entrance Area"
                  className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                />
              </div>
            </div>

           
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <label className="block text-white text-sm font-semibold">Capacity</label>
                <input
                  name="capacity"
                  value={formData.capacity}
                  onChange={handlechange}
                  type="number"
                  placeholder="50"
                  className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold">Type</label>
                <input
                  name="type"
                  value={formData.type}
                  onChange={handlechange}
                  type="text"
                  placeholder="Standard / VIP"
                  className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                />
              </div>

          
   {/* Status + Latitude (shorter latitude box) */}
<div className="mt-4 grid  lg:grid-cols-2 items-end gap-90">
  <div className="w-[350px]">
    <label className="block text-white text-sm font-semibold">Status</label>
    <select
      name="status"
      value={formData.status}
      onChange={handlechange}
      className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2"
    >
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  </div>

  <div className="flex flex-col w-[350px]"> {/* 👈 shorter width */}
    <label className="block text-white text-sm font-semibold">Latitude</label>
    <input
      name="latitude"
      value={formData.latitude}
      onChange={handlechange}
      type="text"
      placeholder="7.2906"
      className="mt-1 text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
    />
  </div>
</div>



              
            </div>

           
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <label className="block text-white text-sm font-semibold">Price</label>
                <input
                  name="price"
                  value={formData.price}
                  onChange={handlechange}
                  type="number"
                  placeholder="300"
                  className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold">Distance</label>
                <input
                  name="distance"                     
                  value={formData.distance}
                  onChange={handlechange}
                  type="text"
                  placeholder="50m"
                  className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                />
              </div>
            </div>


           <div className="mt-4">
              <label className="block text-white text-sm font-semibold">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handlechange}
                rows="4"
                placeholder="Provide a detailed description of the parking zone"
                className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
              />
             
            </div>
            

              

           
          

            <label className="block text-white mt-4 text-sm font-semibold">Features</label>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
             
              {FACILITY_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-gray-200 text-sm bg-white/5 border border-white/10 rounded-md p-2">
                  <input
                    type="checkbox"
                    checked={formData.facilities.includes(opt)}
                    onChange={() => toggleFacility(opt)}
                    className="accent-blue-500"
                  />
                  {opt}
                </label>
              ))}
            </div>

           
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-white/5 rounded-md border border-white/10 px-4 py-2 text-white hover:bg-white/10"
              >
                Close
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-md px-4 py-2 text-white font-semibold hover:opacity-80"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddForm;
