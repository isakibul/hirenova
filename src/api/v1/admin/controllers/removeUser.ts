/**
 * Remove user controller
 * @module api/v1/admin/controllers/removeUser
 */
import { NextFunction, Request, Response } from "express";
import * as userService from "../../../../lib/user";

/**
 * Handles user deletion by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
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
