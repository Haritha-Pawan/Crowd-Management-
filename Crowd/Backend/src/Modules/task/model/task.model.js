import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    coordinator: { type: String, default: "" },
    otherStaffs: { type: String, default: "" }, // keep simple: comma-separated names
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["todo", "in_progress", "done", "blocked"], default: "todo" },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);


const Task = mongoose.model("Task", taskSchema);

export default mongoose.model("Task", taskSchema);
