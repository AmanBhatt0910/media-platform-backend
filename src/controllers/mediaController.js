const MediaAsset = require("../models/MediaAsset");
const MediaViewLog = require("../models/MediaViewLog");
const generateSignedUrl = require("../utils/generateSignedUrl");

exports.addMedia = async (req, res) => {
  const { title, type, file_url } = req.body;
  try {
    const media = await MediaAsset.create({ title, type, file_url });
    res.status(201).json({ message: "Media added", media });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStreamUrl = async (req, res) => {
  const { id } = req.params;
  try {
    const media = await MediaAsset.findById(id);
    if (!media) return res.status(404).json({ message: "Media not found" });

    const signedUrl = generateSignedUrl(id);

    // Log the view
    await MediaViewLog.create({ media_id: id, viewed_by_ip: req.ip });

    res.json({ stream_url: signedUrl });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
