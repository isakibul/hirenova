const authService = require("../../../../lib/auth");
const { loginSchema } = require("../../../../lib/validators/authValidator");
const { setAuthCookie } = require("../../../../utils/authCookie");

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
      email,
      password,
    });
    setAuthCookie(res, access_token);

    const response = {
      code: 200,
      message: "Login successful",
      data: null,
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
