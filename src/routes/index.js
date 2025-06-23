const router = require("express").Router();
const { controllers: authControllers } = require("../api/v1/auth");

router.post("/api/v1/auth/register", authControllers.register);
router.post("/api/v1/auth/login", authControllers.login);

module.exports = router;
