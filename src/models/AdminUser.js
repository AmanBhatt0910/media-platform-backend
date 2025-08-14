const mongoose = require("mongoose");

const adminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  hashed_password: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AdminUser", adminUserSchema);
