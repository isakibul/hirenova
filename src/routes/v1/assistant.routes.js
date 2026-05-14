const router = require("express").Router();
const { controllers: assistantControllers } = require("../../api/v1/assistant");
const { assistantLimiter } = require("../../middleware/rateLimits");

router.post("/chat", assistantLimiter, assistantControllers.chat);

module.exports = router;
