
import {isValidObjectId} from 'mongoose';
import ParkingZone from '../model/zone.model.js';
import place from '../../../models/Place.js';

export const createZone = async (req, res) => {
  try {
    const {
      name, location, capacity, type, status, description, price, distance, facilities,
    } = req.body;

    const facilitiesArray = Array.isArray(facilities)
      ? facilities.map(String)
      : facilities ? [String(facilities)] : [];

    const zone = await Place.create({
      name: String(name).trim(),
      location,
      capacity: Number(capacity), // required by validator
      type,
      status: status || "active",
      description: description ?? "",
      price: price === "" || price == null ? undefined : Number(price),
      distance: distance === "" || distance == null ? undefined : Number(distance),
      facilities: facilitiesArray,
    });

    return res.status(201).json({ data: zone }); // <--- consistent API shape
  } catch (err) {
    console.error("createZone error:", err?.message, err?.errors);
    return res.status(400).json({
      message: err?.message || "Validation error",
      errors: err?.errors || null,
    });
  }
};

export const getallZones = async(req,res)=>{
    try{
        const zones = await place.find();
        res.json(zones);
    }catch(err){
        res.status(500).json({message:err.message});
    }
}

export const updateZone = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid zone Id" });
    }

    const update = { ...req.body };

    // keep facilities an array of strings
    if (update.facilities !== undefined) {
      update.facilities = Array.isArray(update.facilities)
        ? update.facilities.map(String)
        : update.facilities
        ? [String(update.facilities)]
        : [];
    }

    const zone = await place.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!zone) return res.status(404).json({ message: "zone not found" });

    return res.json(zone); // keep shape same as your other handlers
  } catch (err) {
    console.error("updateZone error:", err);
    return res.status(400).json({ message: err.message });
  }
};


export const deleteZone = async(req,res) =>{
   
    try{
        
        const{id} = req.params;

        if(!isValidObjectId(id)){
            return res.status(400).json({message:"Invalid zone Id"});
        }

        const zone = await place.findByIdAndDelete(id);

        if(!zone) return res.status(404).json({message:"zone not found"});

        return res.json({message:"Zone deleted Succesfully"});
    }catch(err){
        res.status(500).json({message:err.message});
    }
}





export const getParkingZoneById = async (req, res) => {
  const { id } = req.params;

  try {
    const zone = await place.findById(id);

    if (!zone) {
      return res.status(404).json({ message: "Parking zone not found" });
    }

    res.status(200).json(zone);
  } catch (error) {
    console.error("Error fetching parking zone by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};


