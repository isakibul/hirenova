import { NextFunction, Request, Response } from "express";
import * as jobService from "../../../../lib/job";

const deleteItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = req.params.id as string;

  try {
    await jobService.deleteItem(id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};

export default deleteItem;
