const { JobSeekers } = require("../../../../../model");
const authService = require("../../../../../lib/auth");
const { generateToken } = require("../../../../../lib/token");
const {
  registerSchema,
} = require("../../../../../lib/validators/authValidator");

const register = async (req, res, next) => {
  const { error, value } = await registerSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      code: 400,
      message: "Validation error",
      error: error.details.map((e) => e.message).join(", "),
    });
  }

  const { username, email, password } = value;

  try {
    const user = await authService.register({
      model: JobSeekers,
      username,
      email,
      password,
    });

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    const accessToken = generateToken({ payload });

    const response = {
      code: "201",
      message: "Signup successful",
      data: {
        access_token: accessToken,
      },
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
        login: `${req.protocol}://${req.get("host")}/api/v1/auth/login`,
      },
    };

    res.status(201).json(response);
  } catch (e) {
    next(e);
  }
};

module.exports = register;
