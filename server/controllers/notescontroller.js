const Note = require("../models/Note");
const Project = require("../models/Project");

const hasAccess = (project, userId) =>
  project.owner.toString() === userId.toString() ||
  project.members.some(member =>
    member.toString() === userId.toString()
  );
exports.createNote = async (req, res) => {
  try {
    const { title, content, projectId } = req.body;

    if (!title || !title.trim() || !projectId) {
      return res.status(400).json({
        message: "Title and project are required"
      });
    }

    const project = await Project.findById(projectId);

    if (!project || !hasAccess(project, req.user._id)) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const note = await Note.create({
      title: title.trim(),
      content,
      project: projectId,
      author: req.user._id
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getNotes = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project || !hasAccess(project, req.user._id)) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const notes = await Note.find({
      project: project._id
    }).populate("author", "name email");

    res.json({
      notes,
      ownerId: project.owner.toString()
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found"
      });
    }
    const project = await Project.findById(note.project);
    if (!project || (
      project.owner.toString() !== req.user._id.toString() &&
      note.author.toString() !== req.user._id.toString()
    )) {
      return res.status(403).json({
        message: "Access denied"
      });
    }
    if (req.body.title !== undefined) {
      if (!req.body.title.trim()) {
        return res.status(400).json({
          message: "Title is required"
        });
      }
      note.title = req.body.title.trim();
    }

    if (req.body.content !== undefined) {
      note.content = req.body.content;
    }
    if (req.body.isPublic !== undefined) {
      if (project.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "Only project owner can change sharing settings"
        });
      }
      note.isPublic = req.body.isPublic;
    }

    await note.save();
    res.json(note);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    const project = await Project.findById(note.project);
    if (!project || (
      project.owner.toString() !== req.user._id.toString() &&
      note.author.toString() !== req.user._id.toString()
    )) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    await note.deleteOne();
    res.json({
      message: "Note deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
