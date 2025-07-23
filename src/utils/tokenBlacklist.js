const { client } = require("../config/redisClient");

const addTokenToBlacklist = async (token, expiresInSeconds) => {
  try {
    await client.set(token, "blacklisted", { Ex: expiresInSeconds });
  } catch (e) {
    console.error("Error adding token to blacklist:", err);
  }
};

const isTokenBlacklisted = async (token) => {
  try {
    const result = await client.get(token);
    return result === "blacklisted";
  } catch (e) {
    console.error("Error checking token blacklist status:", e);
    return false;
  }
};

const removeTokenFromBlacklist = async (token) => {
  try {
    await client.del(token);
  } catch (e) {
    console.error("Error removing token from blacklist:", e);
  }
};

module.exports = {
  addTokenToBlacklist,
  isTokenBlacklisted,
  removeTokenFromBlacklist,
};
