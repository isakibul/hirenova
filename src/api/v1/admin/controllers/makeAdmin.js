const mongoose = require("mongoose");
const userService = require("../../../../lib/user");
const { notFound } = require("../../../../utils/error");

const makeAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const user = await userService.findUserById(id);

    if (!user) {
      throw notFound("User not found");
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "User is already an admin." });
    }

    user.role = "admin";
    await user.save();

    res.status(200).json({
      message: "User role updated to admin successfully.",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = makeAdmin;
