import { NextFunction, Request, Response } from "express";
import { authorizationError } from "../utils/error";

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
