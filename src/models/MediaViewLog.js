const mongoose = require("mongoose");

const mediaViewLogSchema = new mongoose.Schema({
  media_id: { type: mongoose.Schema.Types.ObjectId, ref: "MediaAsset", required: true, index: true },
  viewed_by_ip: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
});

mediaViewLogSchema.index({ media_id: 1, timestamp: -1 });
mediaViewLogSchema.index({ media_id: 1, viewed_by_ip: 1 });

module.exports = mongoose.model("MediaViewLog", mediaViewLogSchema);
