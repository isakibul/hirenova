/**
 * Get single user controller (admin)
 * @module api/v1/admin/controllers/getSingleUser
 */
import { NextFunction, Request, Response } from "express";
import * as userService from "../../../../lib/user";
import { notFound } from "../../../../utils/error";

/**
 * Retrieves a single user by ID (admin only)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
const getSingleUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = req.params.id as string;

  try {
    const user = await userService.getSingleUser(id);

    if (!user) {
      throw notFound("User not found");
    }

    const { _id, password, __v, ...rest } = user;
    const sanitizedUser = {
      id: _id ? _id.toString() : user.id,
      ...rest,
    };

    res.status(200).json({
      data: sanitizedUser,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

export default getSingleUser;
