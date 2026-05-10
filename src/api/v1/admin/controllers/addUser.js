const authService = require("../../../../lib/auth");
const Joi = require("joi");

const adminCreateUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string()
    .min(8)
    .max(50)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"))
    .message(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .required(),
  role: Joi.string()
    .valid("jobseeker", "employer", "admin", "superadmin")
    .required(),
});

const adminAssignableRoles = ["jobseeker", "employer"];

const addUser = async (req, res, next) => {
  try {
    const { error, value } = await adminCreateUserSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        code: 400,
        message: "Validation error",
        error: error.details.map((e) => e.message).join(", "),
      });
    }

    const { username, email, password, role } = value;

    if (req.user.role !== "superadmin" && !adminAssignableRoles.includes(role)) {
      return res.status(403).json({
        message: "Only a super admin can create admin accounts.",
      });
    }

    await authService.register({
      username,
      email,
      password,
      role,
    });

    const response = {
      code: 201,
      message: "User registration successful",
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    };

    res.status(201).json(response);
  } catch (e) {
    next(e);
  }
};
module.exports = addUser;
