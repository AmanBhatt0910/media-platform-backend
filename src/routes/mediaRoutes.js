const express = require("express");
const { addMedia, getStreamUrl } = require("../controllers/mediaController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, addMedia);
router.get("/:id/stream-url", getStreamUrl);

module.exports = router;
