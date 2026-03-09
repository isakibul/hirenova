/**
 * Make admin controller
 * @module api/v1/admin/controllers/makeAdmin
 */
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import * as userService from "../../../../lib/user";
import { notFound } from "../../../../utils/error";

/**
 * Handles upgrading a user to admin role
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
const makeAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid user ID." });
      return;
    }

    const user = await userService.findUserById(id);

    if (!user) {
      throw notFound("User not found");
    }

    if (user.role === "admin") {
      res.status(400).json({ message: "User is already an admin." });
      return;
    }

    user.role = "admin";
    await user.save();

    res.status(200).json({
      message: "User role updated to admin successfully.",
      user: {
        id: (user as any)._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    next(e);
  }
};

export default makeAdmin;
