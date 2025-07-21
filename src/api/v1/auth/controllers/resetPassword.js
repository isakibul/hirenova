const bcrypt = require("bcrypt");
const { User } = require("../../../../model");
const { badRequest } = require("../../../../utils/error");

const resetPassword = async (req, res, next) => {
  try {
    const token = req.query.token;
    const newPassword = req.body.newPassword;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw badRequest("Invalid token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      code: 200,
      message: "Password has been reset successfully",
    });
  } catch (e) {
    next(e);
  }
};

module.exports = resetPassword;
