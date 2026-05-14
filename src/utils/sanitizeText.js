const dangerousTagPattern = /<\/?(script|iframe|object|embed|link|meta|style)[^>]*>/gi;
const eventHandlerPattern = /\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const dangerousUrlPattern = /(href|src)\s*=\s*("|')?\s*javascript:[^"'\s>]*/gi;

const sanitizeText = (value = "") =>
  String(value)
    .replace(/\u0000/g, "")
    .replace(dangerousTagPattern, "")
    .replace(eventHandlerPattern, "")
    .replace(dangerousUrlPattern, "$1=\"#\"")
    .trim();

module.exports = sanitizeText;
