const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authmiddleware");
const projectController = require("../controllers/projectcontroller");

router.use(authMiddleware);

router.post("/", projectController.createProject);
router.get("/", projectController.getProjects);
router.post("/:projectId/members", projectController.addMember);
router.delete("/:projectId", projectController.deleteProject);

module.exports = router;