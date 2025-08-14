const express = require("express");
const {
  addMedia,
  getStreamUrl,
  logView,
  getAnalytics,
} = require("../controllers/mediaController");
const authMiddleware = require("../middleware/authMiddleware");
const { viewLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// protect everything under /media
router.use(authMiddleware);

router.post("/", addMedia);
router.get("/:id/stream-url", getStreamUrl);

// limit view posts to prevent abuse
router.post("/:id/view", viewLimiter, logView);
router.get("/:id/analytics", getAnalytics);

module.exports = router;
