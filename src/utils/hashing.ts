import bcrypt from "bcryptjs";

/**
 * Generates a bcrypt hash of the given payload
 * @async
 * @param {string} payload - The string to hash
 * @param {number} [saltRound=10] - The salt round for bcrypt (default 10)
 * @returns {Promise<string>} The hashed string
 */
const generateHash = async (
  payload: string,
  saltRound = 10,
): Promise<string> => {
  const salt = await bcrypt.genSalt(saltRound);
  const hash = await bcrypt.hash(payload, salt);
  return hash;
};

/**
 * Compares a raw string with a hashed string
 * @async
 * @param {string} raw - The raw string to compare
 * @param {string} hash - The hashed string to compare against
 * @returns {Promise<boolean>} True if the strings match, false otherwise
 */
const hashMatched = async (raw: string, hash: string): Promise<boolean> => {
  const result = await bcrypt.compare(raw, hash);
  return result;
};

export { generateHash, hashMatched };
