// backend/src/config/db.js
const mongoose = require("mongoose");

module.exports = function dbConnect() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI missing in .env");
    process.exit(1);
  }

  mongoose
    .connect(uri) // no extra options needed on modern drivers
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => {
      console.error("Mongo connection error:", err.message);
      process.exit(1);
    });
};
