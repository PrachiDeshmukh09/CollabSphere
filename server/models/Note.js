const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  content: {
    type: String,
    default: ""
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },

  isPublic: {
    type: Boolean,
    default: false
  },

  attachments: [{
    originalName: String,
    storedName: String,
    mimeType: String,
    size: Number,
    path: String
  }]

}, { timestamps: true });

module.exports = mongoose.model("Note", noteSchema);