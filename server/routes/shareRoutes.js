const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authmiddleware");
const shareController = require("../controllers/sharecontroller");

router.post("/:projectId", authMiddleware, shareController.createShareLink);

router.get("/public/:shareId", shareController.getPublicProject);

module.exports = router;