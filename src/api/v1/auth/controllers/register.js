const authService = require("../../../../lib/auth");
const { generateEmailToken } = require("../../../../lib/token");
const { registerSchema } = require("../../../../lib/validators/authValidator");
const { sendConfirmationEmail } = require("../../../../lib/mailer");

const register = async (req, res, next) => {
  try {
    const { error, value } = await registerSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        code: 400,
        message: "Validation error",
        error: error.details.map((e) => e.message).join(", "),
      });
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
          "host"
        )}/api/v1/auth/confirm-email/${emailToken}`,
      },
    };

    res.status(201).json(response);
  } catch (e) {
    next(e);
  }
};

module.exports = register;
