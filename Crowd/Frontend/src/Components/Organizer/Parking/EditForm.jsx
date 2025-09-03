import React, { useState,useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";


const EditForm = ({ isOpen, onClose,OnCreated ,zoneId,refresh }) => {

  const FACILITY_OPTIONS = [
  "EV charging",
  "CCTV",
  "Handicap accessible",
  "Covered",
  "24/7 access",
  "Security personnel",
  "Restrooms",
  
];


  if (!isOpen) return null;


  const[formData,setFormData] =useState({
     name: "",
    location: "",
    capacity: "",
    type: "Standard",
    status: "active",
    description: "",
    facilities:[],
  })

   useEffect(() => {
  const fetchZone = async () => {
    if (!zoneId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/parking-zone/${zoneId}`);
      setFormData(res.data); // assuming res.data is the zone object
    } catch (err) {
      console.error("Error fetching zone for edit:", err);
      toast.error("Failed to load parking zone data.");
    }
  };

  if (isOpen) {
    fetchZone();
  }
}, [zoneId, isOpen]);



  const handlechange = (e)=>{
    const{name,value} =e.target;
    setFormData(prev => ({...prev, [name]:value}));
  };

    const toggleFacility = (label) => {
    setFormData((prev) => {
      const exists = prev.facilities.includes(label);
      return {
        ...prev,
        facilities: exists
          ? prev.facilities.filter((f) => f !== label)
          : [...prev.facilities, label],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/parking-zone/${zoneId}`, formData);
      toast.success("Parking zone updated successfully");
      refresh?.();
      onClose();
    } catch (error) {
      console.error("Error updating the parking zone", error);
      toast.error("Failed to update parking zone");
    }
  };


  return (
    <div className="fixed z-50 inset-0 flex justify-center items-center bg-black/60">
      <div className="box w-[600px] bg-[#0f172a] p-6 rounded-lg border border-white/10 shadow-xl">
        <h2 className="text-white font-bold text-xl mb-1">Add New Parking Zone</h2>
        <h6 className="text-gray-300 font-medium text-xs mb-6">
          Create a new parking zone for the event
        </h6>

        <form className="space-y-4" onSubmit={handleSubmit} >
          {/* Zone Name + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm font-semibold">Zone Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handlechange}
                type="text"
                placeholder="Zone A - Main Parking"
                className="w-full mt-1 text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="text-white text-sm font-semibold">Location</label>
              <input
                name="location"
               value={formData.location}
                onChange={handlechange}
                type="text"
                placeholder="Main Entrance Area"
                className="w-full mt-1 text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Capacity + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm font-semibold">Capacity</label>
              <input
                name="capacity"
                value={formData.capacity}
                onChange={handlechange}
                type="number"
                placeholder="50"
                className="w-full mt-1 text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="text-white text-sm font-semibold">Type</label>
              <input
                name="type"
               value={formData.type}
                onChange={handlechange}
                type="text"
                placeholder="Standard / VIP"
                className="w-full mt-1 text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Status Select */}
          <div>
            <label className="text-white text-sm font-semibold">Status</label>
            <select
              name="status"
              value={formData.status}
                onChange={handlechange}
              className="w-full mt-1 text-white bg-[#272f40] border border-white/20 rounded-md p-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-white text-sm font-semibold">Description</label>
            <textarea
              name="description"
              value={formData.description}
                onChange={handlechange}
             
              placeholder="Describe this parking zone..."
              className="w-full mt-1 text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
              rows={3}
            ></textarea>
          </div>

           <div className="mt-2 grid grid-cols-2 gap-2">
    {FACILITY_OPTIONS.map(opt => (
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

        
          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-5">
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
            >Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditForm;
