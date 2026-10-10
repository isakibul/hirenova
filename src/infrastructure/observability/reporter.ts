const logger = require("./logger");
const { postJson } = require("../../integrations/http");

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
    await postJson(process.env.ERROR_WEBHOOK_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (reportingError) {
    logger.error("Error reporter failed", {
      message: reportingError.message,
      requestId: context.requestId,
    });
  }
};

module.exports = { reportError };
