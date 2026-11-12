const Project = require("../models/Project");
const Note = require("../models/Note");
const crypto = require("crypto");

exports.createShareLink = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found. Please refresh Dashboard."
      });
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only project owner can share project"
      });
    }

    if (!project.shareId) {
      project.shareId = crypto.randomBytes(16).toString("hex");
    }

    await project.save();
    const shareLink = `http://localhost:5173/public/${project.shareId}`;

    res.json({
      message: "Share link generated successfully",
      shareLink
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
exports.getPublicProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      shareId: req.params.shareId
    }).select("name description shareId");

    if (!project) {
      return res.status(404).json({
        message: "Project not found in database"
      });
    }
    const notes = await Note.find({
      project: project._id,
      isPublic: true
    }).select("title content createdAt");
    res.json({ project, notes });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};