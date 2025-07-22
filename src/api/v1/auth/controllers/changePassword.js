const { badRequest } = require("../../../../utils/error");
const { findUserById } = require("../../../../lib/user");
const bcrypt = require("bcryptjs");

const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    throw badRequest("Current password and new password are required");
  }

  try {
    const user = await findUserById(userId);

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      throw badRequest("Current password is incorrect");
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw badRequest(
        "New password cannot be the same as the current password"
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (e) {
    next(e);
  }
};

module.exports = changePassword;
