const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authmiddleware");

const {
  uploadFile,
  getFiles,
  deleteFile
} = require("../controllers/filecontroller");

router.use(authMiddleware);

router.post("/", upload.single("file"), uploadFile);
router.get("/:projectId", getFiles);
router.delete("/:id", deleteFile);

module.exports = router;