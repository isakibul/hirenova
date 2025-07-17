const authService = require("../../../../lib/auth");
const { registerSchema } = require("../../../../lib/validators/authValidator");

const addUser = async (req, res, next) => {
  try {
    const { error, value } = await registerSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        code: 400,
        message: "Validation error",
        error: error.details.map((e) => e.message).join(", "),
      });
    }

    const { username, email, password, role } = value;

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
