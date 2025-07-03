const { Employer } = require("../../../../../model");
const authService = require("../../../../../lib/auth");
const { loginSchema } = require("../../../../../lib/validators/authValidator");

const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        code: 400,
        message: "Validation error",
        error: error.details.map((e) => e.message).join(", "),
      });
    }

    const { email, password } = value;

    const access_token = await authService.login({
      model: Employer,
      email,
      password,
    });

    const response = {
      code: 200,
      message: "Login successful",
      data: {
        accessToken: access_token,
      },
      link: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    };

    res.status(200).json(response);
  } catch (e) {
    next(e);
  }
};

module.exports = login;
