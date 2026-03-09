import { NextFunction, Request, Response } from "express";
import * as jobService from "../lib/job";
import { authorizationError } from "../utils/error";

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
