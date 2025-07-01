const { Employer } = require("../../../../../model");
const authService = require("../../../../../lib/auth");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

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
