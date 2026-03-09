import { NextFunction, Request, Response } from "express";
import { generateToken, verifyEmailToken } from "../../../../lib/token";
import { findUserByEmail } from "../../../../lib/user";
import { notFound } from "../../../../utils/error";

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
