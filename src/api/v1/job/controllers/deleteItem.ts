/**
 * Delete job controller
 * @module api/v1/job/controllers/deleteItem
 */
import { NextFunction, Request, Response } from "express";
import * as jobService from "../../../../lib/job";

/**
 * Handles job deletion by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
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
