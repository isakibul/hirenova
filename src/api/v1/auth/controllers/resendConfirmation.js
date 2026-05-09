const { generateEmailToken } = require("../../../../lib/token");
const { sendConfirmationEmail } = require("../../../../lib/mailer");
const userService = require("../../../../lib/user");
const { badRequest, notFound } = require("../../../../utils/error");
const { getClientLink } = require("../../../../utils/clientUrl");

const resendConfirmation = async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      throw badRequest("Email is required");
    }

    const user = await userService.findUserByEmail(email);

    if (!user) {
      throw notFound("User not found");
    }

    if (user.status === "active") {
      throw badRequest("Email is already confirmed");
    }

    const emailToken = generateEmailToken({ email: user.email });
    const confirmEmailLink = getClientLink(
      `/confirm-email?token=${encodeURIComponent(emailToken)}`
    );

    await sendConfirmationEmail(user.email, confirmEmailLink);

    res.status(200).json({
      code: 200,
      message: "Confirmation email sent successfully",
    });
  } catch (e) {
    next(e);
  }
};

module.exports = resendConfirmation;
