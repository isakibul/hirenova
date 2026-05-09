const router = require("express").Router();
const { controllers: dashboardControllers } = require("../../api/v1/dashboard");
const authenticate = require("../../middleware/authenticate");

router.get("/", authenticate, dashboardControllers.getSummary);

module.exports = router;
