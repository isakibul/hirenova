import { NextFunction, Request, Response } from "express";
import { decodeToken } from "../../../../lib/token";
import { badRequest } from "../../../../utils/error";
import { addTokenToBlacklist } from "../../../../utils/tokenBlacklist";

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
