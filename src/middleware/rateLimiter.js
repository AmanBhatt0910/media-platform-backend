const rateLimit = require("express-rate-limit");

// Limit view logs to 30 requests / 5 minutes per IP per media id
const viewLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30,
  keyGenerator: (req /*, res*/) => {
    // key per IP per media id
    const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip || req.socket.remoteAddress;
    return `${req.params.id}:${ip}`;
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res /*, next */) => {
    return res.status(429).json({ error: "Too many view events. Please slow down." });
  },
});

module.exports = { viewLimiter };
