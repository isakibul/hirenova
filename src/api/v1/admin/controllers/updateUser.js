const Joi = require("joi");
const userService = require("../../../../lib/user");
const apiContract = require("../../../../lib/apiContract");

const adminLevelRoles = ["admin", "superadmin"];

const adminUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).optional(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional(),
  role: Joi.string().valid(...apiContract.roles.user).optional(),
  status: Joi.string().valid(...apiContract.users.statuses).optional(),
  skills: Joi.array().items(Joi.string().max(80)).optional(),
  resumeUrl: Joi.string().uri().max(500).allow("").optional(),
  experience: Joi.number().min(0).optional(),
  preferredLocation: Joi.string().max(100).allow("").optional(),
  companyName: Joi.string().max(120).allow("").optional(),
  companyWebsite: Joi.string().uri().max(500).allow("").optional(),
  companySize: Joi.string().max(50).allow("").optional(),
});

const updateUser = async (req, res, next) => {
  try {
    const { error, value } = adminUserSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: "Validation error",
        errors: error.details.map((detail) => detail.message),
      });
    }

    const targetUser = await userService.findUserById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const requesterIsSuperAdmin = req.user.role === "superadmin";
    const targetUserId = targetUser.id ?? targetUser._id?.toString();

    if (!requesterIsSuperAdmin && adminLevelRoles.includes(targetUser.role)) {
      return res.status(403).json({
        message: "Only a super admin can update admin accounts.",
      });
    }

    if (value.status === "suspended" && targetUserId === req.user.id) {
      return res.status(403).json({
        message: "You cannot suspend your own account.",
      });
    }

    if (value.role) {
      if (targetUserId === req.user.id && value.role !== targetUser.role) {
        return res.status(403).json({
          message: "You cannot change your own role.",
        });
      }

      const changesAdminLevelRole =
        adminLevelRoles.includes(targetUser.role) ||
        adminLevelRoles.includes(value.role);

      if (!requesterIsSuperAdmin && changesAdminLevelRole) {
        return res.status(403).json({
          message:
            "Only a super admin can grant, remove, or change admin access.",
        });
      }

      if (!requesterIsSuperAdmin && !apiContract.roles.adminManaged.includes(value.role)) {
        return res.status(403).json({
          message: "Admins can only switch users between job seeker and employer.",
        });
      }
    }

    const user = await userService.updateUserByAdmin(req.params.id, {
      ...value,
      email: value.email?.toLowerCase(),
    });
    const { password, __v, ...data } = user;

    res.status(200).json({
      message: "User updated successfully",
      data,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = updateUser;
