const serverError = (msg = "Internal Server Error") => {
  console.log(msg);
  const error = new Error(msg);
  error.status = 500;
  error.statusCode = 500;
  return error;
};

const badRequest = (msg = "Bad Request") => {
  const error = new Error(msg);
  error.status = 400;
  error.statusCode = 400;
  return error;
};

const notFound = (msg = "Not Found") => {
  const error = new Error(msg);
  error.status = 404;
  error.statusCode = 404;
  return error;
};

const authenticationError = (msg = "Authentication failed") => {
  const error = new Error(msg);
  error.status = 401;
  return error;
};

const authorizationError = (msg = "Permission denied") => {
  const error = new Error(msg);
  error.status = 403;
  return error;
};

module.exports = {
  serverError,
  badRequest,
  notFound,
  authenticationError,
  authorizationError,
};
