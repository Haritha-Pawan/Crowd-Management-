import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// SL NIC: 12 digits OR 9 digits + V/X
const nicRegex = /^(?:\d{12}|\d{9}[VvXx])$/;

const AttendeeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email:    { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    phone:    { type: String, trim: true },
    nic: {
      type: String, required: true, trim: true, uppercase: true, unique: true, index: true,
      validate: {
        validator: (v) => nicRegex.test(String(v || "")),
        message: "NIC must be 12 digits OR 9 digits followed by V/X",
      },
    },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

// Helpers
AttendeeSchema.methods.setPassword = async function (plain) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(plain, salt);
};

AttendeeSchema.methods.toJSON = function () {
  const o = this.toObject();
  delete o.passwordHash;
  return o;
};

const Attendee = mongoose.model("Attendee", AttendeeSchema);
export default Attendee;
