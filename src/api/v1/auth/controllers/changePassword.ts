/**
 * Change password controller
 * @module api/v1/auth/controllers/changePassword
 */
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import { findUserById } from "../../../../lib/user";
import { badRequest } from "../../../../utils/error";

/**
 * Handles password change for authenticated users
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  if (!currentPassword || !newPassword) {
    throw badRequest("Current password and new password are required");
  }

  try {
    const user = await findUserById(userId);

    const isMatch = await bcrypt.compare(
      currentPassword,
      (user as any).password,
    );

    if (!isMatch) {
      throw badRequest("Current password is incorrect");
    }

    const isSamePassword = await bcrypt.compare(
      newPassword,
      (user as any).password,
    );
    if (isSamePassword) {
      throw badRequest(
        "New password cannot be the same as the current password",
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    (user as any).password = hashedPassword;
    await (user as any).save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (e) {
    next(e);
  }
};

export default changePassword;
