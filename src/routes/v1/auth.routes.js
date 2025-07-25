const router = require("express").Router();
const { controllers: authController } = require("../../api/v1/auth");
const authenticate = require("../../middleware/authenticate");

router.post("/signup", authController.register);
router.post("/login", authController.login);
router.patch("/confirm-email/:token", authController.confirmEmail);
router.patch("/forgot-password", authController.forgotPassword);
router.patch("/reset-password", authController.resetPassword);
router.patch("/change-password", authenticate, authController.changePassword);
router.post("/logout", authenticate, authController.logout);

module.exports = router;
