import { NextFunction, Request, Response } from "express";
import * as tokenService from "../lib/token";
import * as userService from "../lib/user";
import { authenticationError } from "../utils/error";
import { isTokenBlacklisted } from "../utils/tokenBlacklist";

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
