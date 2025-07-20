const jwt = require("jsonwebtoken");

const generateToken = ({
  payload,
  algorithm = "HS256",
  secret = process.env.ACCESS_TOKEN_SECRET,
  expiresIn = "300h",
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

const generateEmailToken = (payload) => {
  return jwt.sign(payload, process.env.EMAIL_SECRET, { expiresIn: "1d" });
};

const verifyEmailToken = (token) => {
  return jwt.verify(token, process.env.EMAIL_SECRET);
};

module.exports = {
  generateToken,
  decodeToken,
  verifyToken,
  generateEmailToken,
  verifyEmailToken,
};
