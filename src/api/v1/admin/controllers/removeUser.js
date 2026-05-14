const userService = require("../../../../lib/user");
const { authorizationError, notFound } = require("../../../../utils/error");

const adminLevelRoles = ["admin", "superadmin"];

const removeUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await userService.findUserById(id);

    if (!user) {
      throw notFound("User not found");
    }

    const targetUserId = user.id ?? user._id?.toString();
    if (targetUserId === req.user.id) {
      throw authorizationError("You cannot delete your own account.");
    }

    if (adminLevelRoles.includes(user.role) && req.user.role !== "superadmin") {
      throw authorizationError("Only a super admin can delete admin accounts.");
    }

    await userService.removeUser(id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};

module.exports = removeUser;
