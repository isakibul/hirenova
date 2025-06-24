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

module.exports = {
  serverError,
  badRequest,
};
