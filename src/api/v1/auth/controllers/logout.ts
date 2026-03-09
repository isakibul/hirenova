/**
 * User logout controller
 * @module api/v1/auth/controllers/logout
 */
import { NextFunction, Request, Response } from "express";
import { decodeToken } from "../../../../lib/token";
import { badRequest } from "../../../../utils/error";
import { addTokenToBlacklist } from "../../../../utils/tokenBlacklist";

/**
 * Handles user logout by blacklisting the token
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.token!;

    const decoded = decodeToken({ token });

    if (!decoded || !decoded.exp) {
      throw badRequest("Invalid token");
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - currentTime;

    if (expiresIn > 0) {
      await addTokenToBlacklist(token, expiresIn);
    }

    res.status(200).json({ message: "Logout successful" });
  } catch (e) {
    next(e);
  }
};

export default logout;
