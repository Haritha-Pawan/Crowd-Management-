
import {isValidObjectId} from 'mongoose';
import ParkingZone from '../model/zone.model.js';

export const createZone = async (req,res) => {

    try{

     const { name, location, capacity, type, status, description, facilities } = req.body;

       const facilitiesArray = Array.isArray(facilities)
      ? facilities.map(String)
      : facilities
      ? [String(facilities)]
      : [];

        const zone  = await ParkingZone.create({
           name,
      location,
      capacity: Number(capacity),
      type,
      status: status || "active",
      description,
      facilities: facilitiesArray,  
        });
        res.status(201).json({zone});
    }catch(err){
        res.status(400).json({message:err.message});
    }



};


export const getallZones = async(req,res)=>{
    try{
        const zones = await ParkingZone.find();
        res.json(zones);
    }catch(err){
        res.status(500).json({message:err.message});
    }
}

export const updateZone = async(req,res) =>{
    try{
        const zone = await ParkingZone.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true,
        });
        if(!zone) return res.status(404).json({message:"zone not found"});
        res.json(zone);
    }catch(err){
        res.status(400).json({message:err.message});
    }
};


export const deleteZone = async(req,res) =>{
   
    try{
        const{id} = req.params;

        if(!isValidObjectId(id)){
            return res.status(400).json({message:"Invalid zone Id"});
        }

        const zone = await ParkingZone.findByIdAndDelete(id);

        if(!zone) return res.status(404).json({message:"zone not found"});

        return res.json({message:"Zone deleted Succesfully"});
    }catch(err){
        res.status(500).json({message:err.message});
    }
}





export const getParkingZoneById = async (req, res) => {
  const { id } = req.params;

  try {
    const zone = await ParkingZone.findById(id);

    if (!zone) {
      return res.status(404).json({ message: "Parking zone not found" });
    }

    res.status(200).json(zone);
  } catch (error) {
    console.error("Error fetching parking zone by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};
