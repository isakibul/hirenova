const router = require("express").Router();
const multer = require("multer");
const { controllers: authController } = require("../../api/v1/auth");
const authenticate = require("../../middleware/authenticate");
const { maxResumeSize } = require("../../lib/resume");

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxResumeSize,
  },
});

router.post("/signup", authController.register);
router.post("/login", authController.login);
router.post("/resend-confirmation", authController.resendConfirmation);
router.get("/confirm-email/:token", authController.confirmEmail);
router.get("/profile", authenticate, authController.getProfile);
router.patch("/profile", authenticate, authController.updateProfile);
router.post(
  "/profile/resume",
  authenticate,
  resumeUpload.single("resume"),
  authController.uploadResume
);
router.post(
  "/profile/resume/parse",
  authenticate,
  resumeUpload.single("resume"),
  authController.parseResume
);
router.patch("/forgot-password", authController.forgotPassword);
router.patch("/reset-password", authController.resetPassword);
router.patch("/change-password", authenticate, authController.changePassword);
router.patch("/deactivate", authenticate, authController.deactivateAccount);
router.post("/logout", authenticate, authController.logout);

module.exports = router;
