const bcrypt = require("bcryptjs");
const { findUserById } = require("../../../../lib/user");
const { badRequest, notFound } = require("../../../../utils/error");

const deactivateAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      throw badRequest("Password is required");
    }

    const user = await findUserById(req.user.id);

    if (!user) {
      throw notFound("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw badRequest("Password is incorrect");
    }

    user.status = "suspended";
    await user.save();

    res.status(200).json({
      code: 200,
      message: "Account deactivated successfully",
    });
  } catch (e) {
    next(e);
  }
};

module.exports = deactivateAccount;
