import { client } from "../config/redisClient";

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

const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  try {
    const result = await client.get(token);
    return result === "blacklisted";
  } catch (e) {
    console.error("Error checking token blacklist status:", e);
    return false;
  }
};

const removeTokenFromBlacklist = async (token: string): Promise<void> => {
  try {
    await client.del(token);
  } catch (e) {
    console.error("Error removing token from blacklist:", e);
  }
};

export { addTokenToBlacklist, isTokenBlacklisted, removeTokenFromBlacklist };
