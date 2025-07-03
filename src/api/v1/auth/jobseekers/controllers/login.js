const { JobSeekers } = require("../../../../../model");
const authService = require("../../../../../lib/auth");
const { loginSchema } = require("../../../../../lib/validators/authValidator");

const login = async (req, res, next) => {
  try {
    const { error, value } = await loginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        code: 400,
        message: "Validation error",
        error: error.details.map((e) => e.message).join(", "),
      });
    }

    const { email, password } = value;

    const accessToken = await authService.login({
      model: JobSeekers,
      email,
      password,
    });

    const response = {
      code: 200,
      message: "Login successful",
      data: {
        access_token: accessToken,
      },
      link: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = login;
