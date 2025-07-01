const { JobSeekers } = require("../../../../../model");
const authService = require("../../../../../lib/auth");
const { generateToken } = require("../../../../../lib/token");

const register = async (req, res, next) => {
  const { username, email, password, role } = req.body;

  try {
    const user = await authService.register({
      model: JobSeekers,
      username,
      email,
      password,
      role,
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
