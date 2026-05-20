const router = require("express").Router();
const newsletterControllers = require("./controllers");
const { newsletterLimiter } = require("../../middleware/rateLimits");

router.post("/", newsletterLimiter, newsletterControllers.subscribe);

module.exports = router;
