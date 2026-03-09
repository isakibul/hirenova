import { NextFunction, Request, Response } from "express";
import * as authService from "../../../../lib/auth";
import { loginSchema } from "../../../../lib/validators/authValidator";

const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      res.status(400).json({
        code: 400,
        message: "Validation error",
        error: error.details.map((e: any) => e.message).join(", "),
      });
      return;
    }

    const { email, password } = value;

    const access_token = await authService.login({
      email,
      password,
    });

    const response = {
      code: 200,
      message: "Login successful",
      data: {
        accessToken: access_token,
      },
      link: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    };

    res.status(200).json(response);
  } catch (e) {
    next(e);
  }
};

export default login;
