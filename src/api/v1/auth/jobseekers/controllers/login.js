const { JobSeekers } = require("../../../../../model");
const authService = require("../../../../../lib/auth");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

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
