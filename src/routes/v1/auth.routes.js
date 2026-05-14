const router = require("express").Router();
const multer = require("multer");
const { controllers: authController } = require("../../api/v1/auth");
const authenticate = require("../../middleware/authenticate");
const {
  authLimiter,
  passwordLimiter,
  writeLimiter,
} = require("../../middleware/rateLimits");
const { maxResumeSize } = require("../../lib/resume");

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxResumeSize,
  },
});

router.post("/signup", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post(
  "/resend-confirmation",
  passwordLimiter,
  authController.resendConfirmation
);
router.get("/confirm-email/:token", authController.confirmEmail);
router.get("/profile", authenticate, authController.getProfile);
router.patch("/profile", writeLimiter, authenticate, authController.updateProfile);
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
router.patch("/forgot-password", passwordLimiter, authController.forgotPassword);
router.patch("/reset-password", passwordLimiter, authController.resetPassword);
router.patch(
  "/change-password",
  passwordLimiter,
  authenticate,
  authController.changePassword
);
router.patch("/deactivate", writeLimiter, authenticate, authController.deactivateAccount);
router.post("/logout", authenticate, authController.logout);

module.exports = router;
