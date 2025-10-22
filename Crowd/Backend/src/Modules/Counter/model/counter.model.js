import mongoose from "mongoose";

 const CounterSchema = new mongoose.Schema(
    {
        name: {
            type: String ,
            unique: true,
            required: [true, "Counter name is required"],
            trim: true,
            minlength: [2, "Counter name must be at least 2 characters"],
            maxlength: [100, "Counter name too long"],
        },
        entrance: {
            type: String,
            required: [true, "Location is required"],
            trim: true,
        },
        status: { 
            type: String, 
            enum: ["Entry", "Exit", "Both"], 
            default: "Entry", 
        },
        capacity: {
            type: Number,
            required: [true, "Capacity is required"],
            min: [1, "Capacity must be greater than zero"],
        },
        // Current load/occupancy shown in the card 
        load: {
            type: Number,
            default: 0,
            min: 0,
            validate: {
                validator(v) {
                if (typeof this.capacity !== "number") return true;
                return v <= this.capacity;
                },
                message: "Load cannot exceed capacity.",
            },
        },

         // If later you build a Staff collection, change this to: 
         // staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" } 
         staff: { 
            type: String, 
            trim: true
         },
         isActive: { 
            type: Boolean, 
            default: true 
        },
    },
    { timestamps: true }
 );

 //create and export the Counter model
const Counter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

 export default Counter;