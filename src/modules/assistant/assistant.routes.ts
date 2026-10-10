const router = require("express").Router();
const assistantControllers = require("./controllers");
const { assistantLimiter } = require("../../middleware/rateLimits");

router.post("/chat", assistantLimiter, assistantControllers.chat);

module.exports = router;
