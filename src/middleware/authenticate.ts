/**
 * Authentication middleware - verifies JWT token and attaches user to request
 * @module middleware/authenticate
 */
import { NextFunction, Request, Response } from "express";
import * as tokenService from "../lib/token";
import * as userService from "../lib/user";
import { authenticationError } from "../utils/error";
import { isTokenBlacklisted } from "../utils/tokenBlacklist";

/**
 * Express middleware to authenticate user via JWT token
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.headers.authorization!.split(" ")[2];

    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw authenticationError(
        "Token has been invalidated. Please log in again.",
      );
    }

    const decoded = tokenService.verifyToken({ token });

    const user = await userService.findUserByEmail(decoded.email as string);

    if (!user) {
      next(authenticationError());
      return;
    }

    req.user = { ...(user as any)._doc, id: user.id };
    req.token = token;
    next();
  } catch (err) {
    next(authenticationError());
  }
};

export default authenticate;
