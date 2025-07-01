const router = require("express").Router();
const {
  controllers: userAuthControllers,
} = require("../api/v1/auth/jobseekers");
const {
  controllers: employerAuthControllers,
} = require("../api/v1/auth/employer");

router.post("/api/v1/auth/jobseeker-register", userAuthControllers.register);
router.post("/api/v1/auth/jobseeker-login", userAuthControllers.login);

router.post("/api/v1/auth/employer-register", employerAuthControllers.register);
router.post("/api/v1/auth/employer-login", employerAuthControllers.login);

module.exports = router;
