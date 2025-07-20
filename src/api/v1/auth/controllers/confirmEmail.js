const { verifyEmailToken, generateToken } = require("../../../../lib/token");
const { findUserByEmail } = require("../../../../lib/user/index");
const { notFound } = require("../../../../utils/error");

const confirmEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const decoded = verifyEmailToken(token);

    const user = await findUserByEmail(decoded.email);
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

    return res.status(200).json(response);
  } catch (e) {
    next(e);
  }
};

module.exports = confirmEmail;
