const mongoose = require("mongoose");
const MediaAsset = require("../models/MediaAsset");
const MediaViewLog = require("../models/MediaViewLog");
const generateSignedUrl = require("../utils/generateSignedUrl");
const redis = require("../config/redis");

// helper to get client IP
function getClientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (xf) return xf.split(",")[0].trim();
  return req.ip || req.socket?.remoteAddress || null;
}

const analyticsKey = (id) => `analytics:${id}`;

exports.addMedia = async (req, res) => {
  const { title, type, file_url } = req.body;
  try {
    const media = await MediaAsset.create({ title, type, file_url });
    return res.status(201).json({ message: "Media added", media });
  } catch (err) {
    console.error("Error adding media:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getStreamUrl = async (req, res) => {
  const { id } = req.params;
  try {
    const media = await MediaAsset.findById(id);
    if (!media) return res.status(404).json({ message: "Media not found" });

    const signedUrl = generateSignedUrl(id);

    // optional: log anonymous access attempt
    await MediaViewLog.create({
      media_id: id,
      viewed_by_ip: getClientIp(req),
      timestamp: new Date(),
    });

    // invalidate cache because we logged a view
    try { await redis.del(analyticsKey(id)); } catch (e) { /* ignore cache delete errors */ }

    return res.json({ stream_url: signedUrl });
  } catch (err) {
    console.error("Error getting stream URL:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.logView = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid media id" });

    const media = await MediaAsset.findById(id).lean();
    if (!media) return res.status(404).json({ error: "Media not found" });

    await MediaViewLog.create({
      media_id: id,
      viewed_by_ip: getClientIp(req),
      timestamp: new Date(),
    });

    // invalidate analytics cache
    try { await redis.del(analyticsKey(id)); } catch (e) { /* ignore */ }

    return res.status(201).json({ message: "View logged successfully" });
  } catch (err) {
    console.error("Error logging view:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid media id" });

    const media = await MediaAsset.findById(id).lean();
    if (!media) return res.status(404).json({ error: "Media not found" });

    // Try Redis cache
    const cacheKey = analyticsKey(id);
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        res.set("X-Cache", "HIT");
        return res.json(JSON.parse(cached));
      }
    } catch (e) {
      // log redis read error but continue to compute result
      console.warn("Redis read failed:", e.message);
    }

    // Aggregation pipeline in Mongo
    const pipeline = [
      { $match: { media_id: new mongoose.Types.ObjectId(id) } },
      {
        $facet: {
          totals: [{ $count: "total_views" }],
          uniqueIps: [{ $group: { _id: "$viewed_by_ip" } }, { $count: "unique_ips" }],
          perDay: [
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ];

    const [result] = await MediaViewLog.aggregate(pipeline);

    const total_views = result?.totals?.[0]?.total_views || 0;
    const unique_ips = result?.uniqueIps?.[0]?.unique_ips || 0;
    const views_per_day = {};
    (result?.perDay || []).forEach((d) => { views_per_day[d._id] = d.count; });

    const payload = { total_views, unique_ips, views_per_day };

    // Store in cache with TTL 60 seconds
    try {
      await redis.setex(cacheKey, 60, JSON.stringify(payload));
    } catch (e) {
      console.warn("Redis set failed:", e.message);
    }

    res.set("X-Cache", "MISS");
    return res.json(payload);
  } catch (err) {
    console.error("Error getting analytics:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
