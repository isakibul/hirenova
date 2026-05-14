const logger = require("./logger");

const reportError = async (error, context = {}) => {
  const payload = {
    message: error?.message || "Unknown error",
    stack: error?.stack,
    context,
    timestamp: new Date().toISOString(),
  };

  logger.error("Unhandled request error", payload);

  if (!process.env.ERROR_WEBHOOK_URL) {
    return;
  }

  try {
    await fetch(process.env.ERROR_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (reportingError) {
    logger.error("Error reporter failed", {
      message: reportingError.message,
      requestId: context.requestId,
    });
  }
};

module.exports = { reportError };
