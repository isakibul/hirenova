const router = require("express").Router();
const { controllers: newsletterControllers } = require("../../api/v1/newsletter");
const { newsletterLimiter } = require("../../middleware/rateLimits");

router.post("/", newsletterLimiter, newsletterControllers.subscribe);

module.exports = router;
