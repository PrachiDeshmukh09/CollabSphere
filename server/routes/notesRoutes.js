const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authmiddleware");
const noteController = require("../controllers/notescontroller");

router.use(authMiddleware);

router.post("/", noteController.createNote);
router.get("/:projectId", noteController.getNotes);
router.put("/:id", noteController.updateNote);
router.delete("/:id", noteController.deleteNote);

module.exports = router;