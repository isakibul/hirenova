const { inspect } = require("node:util");

const formatValue = (value) =>
  typeof value === "string"
    ? value.replace(/[\r\n]+/g, " ")
    : inspect(value, { colors: false, compact: true, breakLength: Infinity });

const writeLog = (level, message, metadata = {}) => {
  const { component, stack, ...details } = metadata;
  const timestamp = new Date().toLocaleTimeString("en-GB", { hour12: false });
  const fields = Object.entries(details)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${formatValue(value)}`);
  const suffix = fields.length ? ` | ${fields.join(" | ")}` : "";
  const line = `${timestamp} ${level.toUpperCase().padEnd(5)} ${formatValue(message)}${suffix}`;
  const output = stack ? `${line}\n${stack}` : line;

  if (level === "error") {
    console.error(output);
    return;
  }

  if (level === "warn") {
    console.warn(output);
    return;
  }

  console.log(output);
};

module.exports = {
  debug: (message, metadata) => writeLog("debug", message, metadata),
  error: (message, metadata) => writeLog("error", message, metadata),
  info: (message, metadata) => writeLog("info", message, metadata),
  warn: (message, metadata) => writeLog("warn", message, metadata),
};
