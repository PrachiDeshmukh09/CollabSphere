const File = require("../models/file");
const Project = require("../models/Project");
const fs = require("fs");

async function hasAccess(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) {
    return false;
  }

  const isOwner = project.owner.toString() === userId.toString();
  const isMember = project.members.some(
    member => member.toString() === userId.toString()
  );
  return isOwner || isMember;
}

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please select a file" });
    }

    const projectId = req.body.projectId;
    if (!projectId) {
      return res.status(400).json({ message: "Project ID required" });
    }

    const allowed = await hasAccess(projectId, req.user._id);
    if (!allowed) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: "Access denied" });
    }

    const file = await File.create({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
      project: projectId,
      uploadedBy: req.user._id
    });

    res.status(201).json({
      message: "File uploaded successfully",
      file
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getFiles = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const allowed = await hasAccess(projectId, req.user._id);

    if (!allowed) {
      return res.status(403).json({ message: "Access denied" });
    }

    const files = await File.find({ project: projectId })
      .populate("uploadedBy", "name");

    const result = files.map(file => {
      return {
        ...file.toObject(),
        url: `/uploads/${encodeURIComponent(file.fileName)}`
      };
    });

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const project = await Project.findById(file.project);
    if (!project) {
      return res.status(403).json({ message: "Access denied" });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isUploader = file.uploadedBy.toString() === req.user._id.toString();
    if (!isOwner && !isUploader) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    await file.deleteOne();
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  uploadFile,
  getFiles,
  deleteFile
};
