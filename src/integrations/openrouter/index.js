const { postJson } = require("../http");

const defaultOpenRouterUrl = "https://openrouter.ai/api/v1/chat/completions";

const getOpenRouterHeaders = () => ({
  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  "Content-Type": "application/json",
  "HTTP-Referer":
    process.env.OPENROUTER_SITE_URL ||
    process.env.CLIENT_URL ||
    "http://localhost:3000",
  "X-Title": process.env.OPENROUTER_APP_NAME || "HireNova",
});

const createChatCompletion = (payload, options = {}) =>
  postJson(process.env.OPENROUTER_API_URL || defaultOpenRouterUrl, payload, {
    headers: getOpenRouterHeaders(),
    timeoutMs: options.timeoutMs ?? process.env.OPENROUTER_TIMEOUT_MS,
  });

module.exports = {
  createChatCompletion,
};
