/**
 * Authorization middleware - checks user roles
 * @module middleware/authorize
 */
import { NextFunction, Request, Response } from "express";
import { authorizationError } from "../utils/error";

/**
 * Creates middleware to authorize users based on their roles
 * @param {string[]} roles - Array of allowed roles (default: ["admin"])
 * @returns {Function} Express middleware function
 */
const authorize =
  (roles: string[] = ["admin"]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (roles.includes(req.user!.role)) {
      return next();
    }
    return next(
      authorizationError("You do not have permission to perform this action"),
    );
  };

export default authorize;
