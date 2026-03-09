import { NextFunction, Request, Response } from "express";
import * as userService from "../../../../lib/user";

const removeUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = req.params.id as string;

  try {
    await userService.removeUser(id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};

export default removeUser;
