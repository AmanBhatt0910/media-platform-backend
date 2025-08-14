module.exports = function getClientIp(req) {
  const xfwd = req.headers["x-forwarded-for"];
  if (xfwd) {
    // first IP in list is client
    return xfwd.split(",")[0].trim();
  }
  // Express populates req.ip (may be "::ffff:127.0.0.1")
  const ip = req.ip || req.connection?.remoteAddress || "";
  return ip.replace("::ffff:", "");
};
