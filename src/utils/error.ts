interface AppError extends Error {
  status?: number;
}

const serverError = (msg = "Internal Server Error"): AppError => {
  const error: AppError = new Error(msg);
  error.status = 500;
  return error;
};

const badRequest = (msg = "Bad Request"): AppError => {
  const error: AppError = new Error(msg);
  error.status = 400;
  return error;
};

const notFound = (msg = "Not Found"): AppError => {
  const error: AppError = new Error(msg);
  error.status = 404;
  return error;
};

const authenticationError = (msg = "Authentication failed"): AppError => {
  const error: AppError = new Error(msg);
  error.status = 401;
  return error;
};

const authorizationError = (msg = "Permission denied"): AppError => {
  const error: AppError = new Error(msg);
  error.status = 403;
  return error;
};

export {
  authenticationError,
  authorizationError,
  badRequest,
  notFound,
  serverError,
};
