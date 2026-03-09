/**
 * Add user controller (admin)
 * @module api/v1/admin/controllers/addUser
 */
import { NextFunction, Request, Response } from "express";
import * as authService from "../../../../lib/auth";
import { registerSchema } from "../../../../lib/validators/authValidator";

/**
 * Handles user registration by admin
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
const addUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = await registerSchema.validate(req.body);

    if (error) {
      res.status(400).json({
        code: 400,
        message: "Validation error",
        error: error.details.map((e: any) => e.message).join(", "),
      });
      return;
    }

    const { username, email, password, role } = value;

    await authService.register({
      username,
      email,
      password,
      role,
    });

    const response = {
      code: 201,
      message: "User registration successful",
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    };

    res.status(201).json(response);
  } catch (e) {
    next(e);
  }
};

export default addUser;
