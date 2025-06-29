const router = require("express").Router();
const { controllers: userAuthControllers } = require("../api/v1/auth");
const { controllers: employerAuthControllers } = require("../api/v1/employer");

router.post("/api/v1/auth/user-register", userAuthControllers.register);
router.post("/api/v1/auth/user-login", userAuthControllers.login);

router.post("/api/v1/auth/employer-register", employerAuthControllers.register);
router.post("/api/v1/auth/employer-login", employerAuthControllers.login);

module.exports = router;
