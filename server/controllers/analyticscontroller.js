const Project = require("../models/Project");
const Note = require("../models/Note");
const File = require("../models/file");

exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalProjects = await Project.countDocuments({
      members: userId
    });

    const totalNotes = await Note.countDocuments({
      author: userId
    });

    const totalFiles = await File.countDocuments({
      uploadedBy: userId
    });

    const projects = await Project.find({
      members: userId
    })
      .populate("members", "name email")
      .populate("owner", "name email");

    const memberContributions = [];

    for (const project of projects) {
      const members = [...project.members];
      if (
        project.owner &&
        !members.some(
          member => member._id.toString() === project.owner._id.toString()
        )
      ) {
        members.push(project.owner);
      }

      for (const member of members) {
        const notesCount = await Note.countDocuments({
          project: project._id,
          author: member._id
        });

        const filesCount = await File.countDocuments({
          project: project._id,
          uploadedBy: member._id
        });

        memberContributions.push({
          projectName: project.name,
          memberName: member.name,
          email: member.email,
          notesCreated: notesCount,
          filesUploaded: filesCount
        });
      }
    }

    res.json({
      totalProjects,
      totalNotes,
      totalFiles,
      memberContributions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};