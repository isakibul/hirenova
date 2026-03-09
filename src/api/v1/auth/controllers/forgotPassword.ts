import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { sendResetEmail } from "../../../../lib/mailer";
import * as userService from "../../../../lib/user";
import { authorizationError, notFound } from "../../../../utils/error";

const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await userService.findUserByEmail(email);

    if (!user) {
      throw notFound("User not found");
    }

    if ((user as any).status === "blocked") {
      throw authorizationError("Your account is blocked");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 3600000;

    user.resetPasswordToken = token;
    user.resetPasswordTokenExpires = new Date(expires);
    await user.save();

    const resetLink = `${req.protocol}://${req.get(
      "host",
    )}/api/v1/auth/reset-password?token=${token}`;

    await sendResetEmail(user.email, resetLink);

    res.status(200).json({
      code: 200,
      message: "Password reset link sent to your email",
    });
  } catch (e) {
    next(e);
  }
};

export default forgotPassword;
