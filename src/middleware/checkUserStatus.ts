import { NextFunction, Request, Response } from "express";
import * as userService from "../lib/user";
import { authenticationError } from "../utils/error";

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
