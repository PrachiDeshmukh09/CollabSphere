const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authmiddleware");

const {
  explainText,
  improveText,
  generateDocs,
  generateReadme,
  explainUploadedCode
} = require("../controllers/geminicontroller");

router.use(authMiddleware);

router.post("/explain", explainText);
router.post("/improve", improveText);
router.post("/documentation", generateDocs);
router.post("/readme", generateReadme);

router.post("/explain-file/:fileId", explainUploadedCode);

module.exports = router;