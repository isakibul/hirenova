const { Employer } = require("../../../../../model");
const authService = require("../../../../../lib/auth");
const { generateToken } = require("../../../../../lib/token");

const register = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    const employer = await authService.register({
      model: Employer,
      username,
      email,
      password,
    });
    const payload = {
      id: employer.id,
      username: employer.username,
      email: employer.email,
    };
    const access_token = generateToken({ payload });
    const response = {
      code: "201",
      message: "Employer registration successful",
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
