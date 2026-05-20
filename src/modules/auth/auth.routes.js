const router = require("express").Router();
const multer = require("multer");
const authController = require("./controllers");
const authenticate = require("../../middleware/authenticate");
const {
  authLimiter,
  passwordLimiter,
  writeLimiter,
} = require("../../middleware/rateLimits");
const { maxResumeSize } = require("../../integrations/resume");

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxResumeSize,
  },
});

router.post("/signup", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.get("/session", authController.session);
router.get("/csrf", authController.csrf);
router.post(
  "/resend-confirmation",
  passwordLimiter,
  authController.resendConfirmation
);
router.get("/confirm-email/:token", authController.confirmEmail);
router.get("/profile", authenticate, authController.getProfile);
router.patch("/profile", writeLimiter, authenticate, authController.updateProfile);
router.post(
  "/role-request/employer",
  writeLimiter,
  authenticate,
  authController.requestEmployerRole
);
router.post(
  "/profile/resume",
  writeLimiter,
  authenticate,
  resumeUpload.single("resume"),
  authController.uploadResume
);
router.post(
  "/profile/resume/parse",
  writeLimiter,
  authenticate,
  resumeUpload.single("resume"),
  authController.parseResume
);
router.get("/resumes/:filename", authenticate, authController.downloadResume);
router.patch("/forgot-password", passwordLimiter, authController.forgotPassword);
router.patch("/reset-password", passwordLimiter, authController.resetPassword);
router.patch(
  "/change-password",
  passwordLimiter,
  authenticate,
  authController.changePassword
);
router.patch("/deactivate", writeLimiter, authenticate, authController.deactivateAccount);
router.post("/logout", authController.logout);

module.exports = router;
