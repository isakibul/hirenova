const writeLog = (level, message, metadata = {}) => {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    service: "hirenova-api",
    environment: process.env.NODE_ENV || "development",
    ...metadata,
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
};

module.exports = {
  debug: (message, metadata) => writeLog("debug", message, metadata),
  error: (message, metadata) => writeLog("error", message, metadata),
  info: (message, metadata) => writeLog("info", message, metadata),
  warn: (message, metadata) => writeLog("warn", message, metadata),
};
