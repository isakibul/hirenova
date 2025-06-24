const jwt = require("jsonwebtoken");

const generateToken = ({
  payload,
  algorithm = "HS256",
  secret = process.env.ACCESS_TOKEN_SECRET,
  expiresIn = "1h",
}) => {
  try {
    return jwt.sign(payload, secret, { algorithm, expiresIn });
  } catch (e) {
    throw serverError();
  }
};

const decodeToken = ({ token }) => {
  try {
    return jwt.decode(token);
  } catch (e) {
    throw serverError();
  }
};

const verifyToken = ({
  token,
  algorithm = "HS256",
  secret = process.env.ACCESS_TOKEN_SECRET,
}) => {
  try {
    return jwt.verify(token, secret, { algorithms: [algorithm] });
  } catch (e) {
    throw serverError();
  }
};

module.exports = {
  generateToken,
  decodeToken,
  verifyToken,
};
