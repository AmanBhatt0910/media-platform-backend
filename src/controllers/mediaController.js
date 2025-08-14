const mongoose = require("mongoose");
const MediaAsset = require("../models/MediaAsset");
const MediaViewLog = require("../models/MediaViewLog");
const generateSignedUrl = require("../utils/generateSignedUrl");

// Utility function to get client IP
function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",").shift() || 
    req.socket?.remoteAddress || 
    null
  );
}

exports.addMedia = async (req, res) => {
  const { title, type, file_url } = req.body;
  try {
    const media = await MediaAsset.create({ title, type, file_url });
    res.status(201).json({ message: "Media added", media });
  } catch (err) {
    console.error("Error adding media:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStreamUrl = async (req, res) => {
  const { id } = req.params;
  try {
    const media = await MediaAsset.findById(id);
    if (!media) return res.status(404).json({ message: "Media not found" });

    const signedUrl = generateSignedUrl(id);

    // Log the view with timestamp
    await MediaViewLog.create({ 
      media_id: id, 
      viewed_by_ip: getClientIp(req),
      timestamp: new Date()
    });

    res.json({ stream_url: signedUrl });
  } catch (err) {
    console.error("Error getting stream URL:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.logView = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid media id" });
    }

    const media = await MediaAsset.findById(id).lean();
    if (!media) return res.status(404).json({ error: "Media not found" });

    await MediaViewLog.create({ 
      media_id: id, 
      viewed_by_ip: getClientIp(req), 
      timestamp: new Date() 
    });

    return res.status(201).json({ message: "View logged successfully" });
  } catch (err) {
    console.error("Error logging view:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid media id" });
    }

    const media = await MediaAsset.findById(id).lean();
    if (!media) return res.status(404).json({ error: "Media not found" });

    const pipeline = [
      { $match: { media_id: new mongoose.Types.ObjectId(id) } },
      {
        $facet: {
          totals: [{ $count: "total_views" }],
          uniqueIps: [
            { $group: { _id: "$viewed_by_ip" } },
            { $count: "unique_ips" }
          ],
          perDay: [
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ];

    const [result] = await MediaViewLog.aggregate(pipeline);

    const total_views = result?.totals?.[0]?.total_views || 0;
    const unique_ips = result?.uniqueIps?.[0]?.unique_ips || 0;

    const views_per_day = {};
    (result?.perDay || []).forEach(d => {
      views_per_day[d._id] = d.count;
    });

    return res.json({ total_views, unique_ips, views_per_day });
  } catch (err) {
    console.error("Error getting analytics:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
