const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authmiddleware");
const analyticsController = require("../controllers/analyticscontroller");

router.use(authMiddleware);
router.get("/", analyticsController.getAnalytics);

module.exports = router;