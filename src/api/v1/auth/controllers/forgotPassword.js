const { sendResetEmail } = require("../../../../lib/mailer");
const userService = require("../../../../lib/user");
const { notFound } = require("../../../../utils/error");
const crypto = require("crypto");

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await userService.findUserByEmail(email);

    if (!user) {
      throw notFound("User not found");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 3600000;

    user.resetPasswordToken = token;
    user.resetPasswordTokenExpires = new Date(expires);
    await user.save();

    const resetLink = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/reset-password?token=${token}`;

    await sendResetEmail(user.email, resetLink);

    res.status(200).json({
      code: 200,
      message: "Password reset link sent to your email",
    });
  } catch (e) {
    next(e);
  }
};

module.exports = forgotPassword;
