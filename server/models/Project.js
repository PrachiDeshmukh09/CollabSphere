const mongoose = require("mongoose");
const crypto = require("crypto");

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    default: "",
    trim: true,
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  shareId: {
    type: String,
    unique: true,
    sparse: true,
    default: () => crypto.randomBytes(16).toString("hex"),
  },

}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);