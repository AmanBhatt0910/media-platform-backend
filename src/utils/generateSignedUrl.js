const crypto = require("crypto");

function generateSignedUrl(mediaId) {
  const expiresAt = Math.floor(Date.now() / 1000) + 600; // 10 minutes
  const signature = crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(`${mediaId}:${expiresAt}`)
    .digest("hex");

  return `${process.env.BASE_STREAM_URL}/${mediaId}?expires=${expiresAt}&sig=${signature}`;
}

module.exports = generateSignedUrl;
