/**
 * Generates a URL query string from an object
 * @param {Record<string, any>} query - Object containing query parameters
 * @returns {string} URL-encoded query string
 * @example
 * generateQueryString({ page: 1, limit: 10 })
 * // Returns: "page=1&limit=10"
 */
const generateQueryString = (query: Record<string, any>): string => {
  return Object.keys(query)
    .map(
      (key) => encodeURIComponent(key) + "=" + encodeURIComponent(query[key]),
    )
    .join("&");
};

export { generateQueryString };
