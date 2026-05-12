const router = require("express").Router();
const { controllers: newsletterControllers } = require("../../api/v1/newsletter");

router.post("/", newsletterControllers.subscribe);

module.exports = router;
