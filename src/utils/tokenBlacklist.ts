import { client } from "../config/redisClient";

/**
 * Adds a token to the blacklist in Redis
 * @async
 * @param {string} token - The JWT token to blacklist
 * @param {number} expiresInSeconds - Time in seconds until the token naturally expires
 * @returns {Promise<void>} Resolves when the token is added to blacklist
 */
const addTokenToBlacklist = async (
  token: string,
  expiresInSeconds: number,
): Promise<void> => {
  try {
    await client.set(token, "blacklisted", { EX: expiresInSeconds });
  } catch (e) {
    console.error("Error adding token to blacklist:", e);
  }
};

/**
 * Checks if a token is blacklisted
 * @async
 * @param {string} token - The JWT token to check
 * @returns {Promise<boolean>} True if token is blacklisted, false otherwise
 */
const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  try {
    const result = await client.get(token);
    return result === "blacklisted";
  } catch (e) {
    console.error("Error checking token blacklist status:", e);
    return false;
  }
};

/**
 * Removes a token from the blacklist
 * @async
 * @param {string} token - The JWT token to remove from blacklist
 * @returns {Promise<void>} Resolves when the token is removed from blacklist
 */
const removeTokenFromBlacklist = async (token: string): Promise<void> => {
  try {
    await client.del(token);
  } catch (e) {
    console.error("Error removing token from blacklist:", e);
  }
};

export { addTokenToBlacklist, isTokenBlacklisted, removeTokenFromBlacklist };
