const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

connectDB();

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/notes", require("./routes/notesRoutes"));
app.use("/api/files", require("./routes/fileRoute"));
app.use("/api/ai", require("./routes/geminiRoutes"));
app.use("/api/share", require("./routes/shareRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/uploads", express.static("uploads"));
app.get("/", (req, res) => {
  res.send("CollabSphere Backend is Running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
