const crypto = require("crypto");

const hashValue = (value = "") => {
  const secret = process.env.OBSERVABILITY_HASH_SECRET || process.env.ACCESS_TOKEN_SECRET || "hirenova";

  return crypto
    .createHmac("sha256", secret)
    .update(String(value).toLowerCase().trim())
    .digest("hex");
};

module.exports = hashValue;
