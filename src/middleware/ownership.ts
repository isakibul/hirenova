/**
 * Ownership check middleware - verifies user owns the resource
 * @module middleware/ownership
 */
import { NextFunction, Request, Response } from "express";
import * as jobService from "../lib/job";
import { authorizationError } from "../utils/error";

/**
 * Creates middleware to check resource ownership
 * @param {string} model - Model name to check ownership for (e.g., "Job")
 * @returns {Function} Express middleware function
 */
const ownership =
  (model = "") =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (model === "Job") {
      const isOwner = await jobService.checkOwnership({
        resourceId: req.params.id as string,
        userId: req.user!.id,
      });

      if (isOwner) {
        return next();
      }

      return next(authorizationError("Operation not allowed"));
    }
  };

export default ownership;
