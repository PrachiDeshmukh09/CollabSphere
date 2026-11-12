const { GoogleGenAI } = require("@google/genai");
const File = require("../models/file");
const Project = require("../models/Project");
const fs = require("fs");
const path = require("path");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});
exports.explainText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Explain this note in simple language:\n${text}`
    });

    res.json({ result: response.text });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.improveText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Improve this note. Correct grammar and make it clear and organized. Keep the original meaning:\n${text}`
    });

    res.json({ result: response.text });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.generateDocs = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ message: "Code is required" });
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate simple documentation for this code:\n${code}`
    });

    res.json({ result: response.text });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.generateReadme = async (req, res) => {
  try {
    const { projectName, description } = req.body;

    if (!projectName || !description) {
      return res.status(400).json({
        message: "Project name and description are required"
      });
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a README.md file for this project.

Project Name: ${projectName}
Description: ${description}`
    });

    res.json({ result: response.text });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.explainUploadedCode = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({
        message: "File not found"
      });
    }
    const project = await Project.findById(file.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }
    const userId = req.user._id.toString();
    const hasAccess =
      project.owner.toString() === userId ||
      project.members.some(member => member.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        message: "Access denied"
      });
    }
    const extension = path.extname(file.originalName).toLowerCase();

    const allowedExtensions = [
      ".js", ".jsx", ".ts", ".tsx",
      ".py", ".java", ".c", ".cpp",
      ".html", ".css", ".json", ".txt"
    ];

    if (!allowedExtensions.includes(extension)) {
      return res.status(400).json({
        message: "This file type is not supported for code explanation"
      });
    }
    if (!fs.existsSync(file.filePath)) {
      return res.status(404).json({
        message: "Uploaded file not found on server"
      });
    }
    if (file.size > 100 * 1024) {
      return res.status(400).json({
        message: "File is too large. Maximum size is 100 KB"
      });
    }
    const code = await fs.promises.readFile(file.filePath, "utf8");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Explain this uploaded code in simple language.
      Describe its purpose, important functions and how it works.

      File Name: ${file.originalName}
      Code:
      ${code}`
    });

    res.json({
      fileName: file.originalName,
      result: response.text
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};