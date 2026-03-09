/**
 * Authentication routes
 * @module routes/v1/auth.routes
 */
import { Router } from "express";
import { controllers as authController } from "../../api/v1/auth";
import authenticate from "../../middleware/authenticate";

const router = Router();

router.post("/signup", authController.register);
router.post("/login", authController.login);
router.patch("/confirm-email/:token", authController.confirmEmail);
router.patch("/forgot-password", authController.forgotPassword);
router.patch("/reset-password", authController.resetPassword);
router.patch("/change-password", authenticate, authController.changePassword);
router.post("/logout", authenticate, authController.logout);

export default router;
