/**
 * Email confirmation controller
 * @module api/v1/auth/controllers/confirmEmail
 */
import { NextFunction, Request, Response } from "express";
import { generateToken, verifyEmailToken } from "../../../../lib/token";
import { findUserByEmail } from "../../../../lib/user";
import { notFound } from "../../../../utils/error";

/**
 * Handles email confirmation and activates user account
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
const confirmEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { token } = req.params;
    const decoded = verifyEmailToken(token as string);

    const user = await findUserByEmail(decoded.email as string);
    if (!user) {
      throw notFound("User not found");
    }

    user.status = "active";
    await user.save();

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const access_token = generateToken({ payload });

    const response = {
      message: "Email confirmed successfully.",
      data: {
        access_token,
      },
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    };

    res.status(200).json(response);
  } catch (e) {
    next(e);
  }
};

export default confirmEmail;
