import { isValidObjectId } from 'mongoose';
import Counter from '../model/counter.model.js';
import ScanLog from '../../Register/Model/scanLog.model.js';

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


export const getallCounter = async (req, res) => {
  try {
    const includeScanLoad =
      String(req.query.includeScanLoad).toLowerCase() === "true" ||
      String(req.query.withScanLoad).toLowerCase() === "true";
    const { counterId } = req.query;

    const filter = {};
    if (counterId) {
      if (!isValidObjectId(counterId)) {
        return res.status(400).json({ message: "Invalid counterId query parameter" });
      }
      filter._id = counterId;
    }

    const counters = await Counter.find(filter).lean();
    if (!includeScanLoad || !counters.length) {
      return res.json(counters);
    }

    const ids = counters
      .map((c) => c?._id)
      .filter((id) => !!id);

    if (!ids.length) {
      return res.json(
        counters.map((c) => ({
          ...c,
          assignedLoad: Number(c.load) || 0,
          loadFromScanLogs: 0,
          scanStats: { totalScans: 0, totalAttendees: 0, lastScanAt: null },
        }))
      );
    }

    const scanStats = await ScanLog.aggregate([
      { $match: { counterId: { $in: ids } } },
      {
        $group: {
          _id: "$counterId",
          totalAttendees: { $sum: { $ifNull: ["$count", 1] } },
          totalScans: { $sum: 1 },
          lastScanAt: { $max: "$createdAt" },
        },
      },
    ]);

    const statsMap = new Map();
    for (const doc of scanStats) {
      statsMap.set(String(doc._id), {
        totalAttendees: doc.totalAttendees || 0,
        totalScans: doc.totalScans || 0,
        lastScanAt: doc.lastScanAt || null,
      });
    }

    const enriched = counters.map((c) => {
      const stats = statsMap.get(String(c._id));
      return {
        ...c,
        assignedLoad: Number(c.load) || 0,
        loadFromScanLogs: stats?.totalAttendees ?? 0,
        scanStats: {
          totalAttendees: stats?.totalAttendees ?? 0,
          totalScans: stats?.totalScans ?? 0,
          lastScanAt: stats?.lastScanAt ?? null,
        },
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

// Get total count of counters (create by lahiru dont touch it devindi)
export const totalCounter = async (req, res) => {
  
  try {
    const count = await Counter.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error counting counters:", error);
    res.status(500).json({ message: "Server error" });
  }   
};
