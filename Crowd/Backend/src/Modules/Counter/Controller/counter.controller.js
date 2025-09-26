import {isValidObjectId} from 'mongoose';
import Counter from '../model/counter.model.js';

export const createCounter = async(req,res) => {
    try{
        const{name,entrance,status,capacity,load,staff,isActive,} = req.body;

        const counter = await Counter.create({
      name,
      entrance,
      status: status || "Entry",
      capacity: Number(capacity),
      load: typeof load === "number" ? load : Number(load) || 0,
      staff,
      isActive: typeof isActive === "boolean" ? isActive : true,
    });
    return res.status(201).json({ counter });
    }
    catch (err) {
    return res.status(400).json({ message: err.message });
  }
};


export const getallCounter = async(req,res) => {
    try{
        const counterT = await Counter.find();
        res.json(counterT);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
}

export const updateCounter = async(req,res) =>{
    try{
        const counter = await Counter.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true,

        });
        if(!counter) return res.status(404).json({message:"Counter not found"});
        res.json(counter);
        }
        catch(err){
            res.status(400).json({message:err.message});
        }
};

export const deleteCounter = async(req,res) => {
    try{
        const {id} = req.params;
         
        if (!isValidObjectId(id)){
            return res.status(400).json({message : "Invalid counter Id"});
        }

        const counter = await Counter.findByIdAndDelete(id);

        if(!counter) return res.status(404).json({message:"Counter not found"});

        return res.json({message:"Counter deleted succefully"});
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
}


export const getCounterById = async (req, res) => {
  const { id } = req.params;

  try {
    const counter = await Counter.findById(id);

    if (!counter) {
      return res.status(404).json({ message: "Counter not found" });
    }

    res.status(200).json(counter);
  } catch (error) {
    console.error("Error fetching counter by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};