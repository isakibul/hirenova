/**
 * User status check middleware - verifies user account is active
 * @module middleware/checkUserStatus
 */
import { NextFunction, Request, Response } from "express";
import * as userService from "../lib/user";
import { authenticationError } from "../utils/error";

/**
 * Express middleware to check if user account is active
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
const checkUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userEmail = req.user!.email;

  const user = await userService.findUserByEmail(userEmail);

  if (!user) {
    next(authenticationError());
    return;
  }

  if (user.status !== "active") {
    res.status(403).json({
      message: `Your account is ${user.status}`,
    });
    return;
  }

  next();
};

export default checkUserStatus;
