const authService = require("../../../../lib/auth");
const { generateToken } = require("../../../../lib/token");
const { registerSchema } = require("../../../../lib/validators/authValidator");

const register = async (req, res, next) => {
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

    const employer = await authService.register({
      username,
      email,
      password,
      role,
    });

    const payload = {
      id: employer.id,
      username: employer.username,
      email: employer.email,
      role: employer.role,
    };

    const access_token = generateToken({ payload });

    const response = {
      code: "201",
      message: "User registration successful",
      data: {
        access_token,
      },
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
        login: `${req.protocol}://${req.get("host")}/api/v1/employer/login`,
      },
    };

    res.status(201).json(response);
  } catch (e) {
    next(e);
  }
};

module.exports = register;
