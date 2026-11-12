
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Connect Database
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/notes", require("./routes/notesRoutes"));
app.use("/api/files", require("./routes/fileRoute"));
app.use("/api/ai", require("./routes/geminiRoutes"));
app.use("/api/share", require("./routes/shareRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/uploads", express.static("uploads"));
// Test Route
app.get("/", (req, res) => {
  res.send("CollabSphere Backend is Running!");
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
