import React, { useState } from "react";

const AddForm = ({ isOpen, onClose }) => {


  if (!isOpen) return null;


  return (
    <div className="fixed z-50 inset-0 flex justify-center items-center bg-black/60">
      <div className="box w-[600px] bg-[#0f172a] p-6 rounded-lg border border-white/10 shadow-xl">
        <h2 className="text-white font-bold text-xl mb-1">Add New Parking Zone</h2>
        <h6 className="text-gray-300 font-medium text-xs mb-6">
          Create a new parking zone for the event
        </h6>

        <form className="space-y-4">
          {/* Zone Name + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm font-semibold">Zone Name</label>
              <input
                name="name"
                
                type="text"
                placeholder="Zone A - Main Parking"
                className="w-full mt-1 text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="text-white text-sm font-semibold">Location</label>
              <input
                name="location"
               
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
                
                type="number"
                placeholder="50"
                className="w-full mt-1 text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="text-white text-sm font-semibold">Type</label>
              <input
                name="type"
               
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
             
              placeholder="Describe this parking zone..."
              className="w-full mt-1 text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
              rows={3}
            ></textarea>
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
            >Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddForm;
