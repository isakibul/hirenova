/**
 * Password reset controller
 * @module api/v1/auth/controllers/resetPassword
 */
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { User } from "../../../../model";
import { badRequest } from "../../../../utils/error";

/**
 * Handles password reset using token from email
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.query.token as string;
    const newPassword = req.body.newPassword;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw badRequest("Invalid token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      code: 200,
      message: "Password has been reset successfully",
    });
  } catch (e) {
    next(e);
  }
};

export default resetPassword;
