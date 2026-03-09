/**
 * User registration controller
 * @module api/v1/auth/controllers/register
 */
import { NextFunction, Request, Response } from "express";
import * as authService from "../../../../lib/auth";
import { sendConfirmationEmail } from "../../../../lib/mailer";
import { generateEmailToken } from "../../../../lib/token";
import { registerSchema } from "../../../../lib/validators/authValidator";

/**
 * Handles user registration
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
const register = async (
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

    const user = await authService.register({
      username,
      email,
      password,
      role,
    });

    const emailToken = generateEmailToken({ email: user.email });
    await sendConfirmationEmail(email, emailToken);

    const response = {
      code: 201,
      message:
        "Registration successful. Please confirm your email to activate your account.",
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
        confirm_email: `${req.protocol}://${req.get(
          "host",
        )}/api/v1/auth/confirm-email/${emailToken}`,
      },
    };

    res.status(201).json(response);
  } catch (e) {
    next(e);
  }
};

export default register;
