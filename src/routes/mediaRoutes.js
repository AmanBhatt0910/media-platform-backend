const express = require("express");
const {
  addMedia,
  getStreamUrl,
  logView,
  getAnalytics
} = require("../controllers/mediaController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

router.post("/", addMedia);
router.get("/:id/stream-url", getStreamUrl);

// NEW:
router.post("/:id/view", logView);
router.get("/:id/analytics", getAnalytics);

module.exports = router;
