/**
 * Custom error interface extending the Error interface
 * @interface AppError
 * @extends Error
 */
interface AppError extends Error {
  status?: number;
}

/**
 * Creates a 500 Internal Server Error
 * @param {string} [msg="Internal Server Error"] - Error message
 * @returns {AppError} Error object with status 500
 */
const serverError = (msg = "Internal Server Error"): AppError => {
  const error: AppError = new Error(msg);
  error.status = 500;
  return error;
};

/**
 * Creates a 400 Bad Request Error
 * @param {string} [msg="Bad Request"] - Error message
 * @returns {AppError} Error object with status 400
 */
const badRequest = (msg = "Bad Request"): AppError => {
  const error: AppError = new Error(msg);
  error.status = 400;
  return error;
};

/**
 * Creates a 404 Not Found Error
 * @param {string} [msg="Not Found"] - Error message
 * @returns {AppError} Error object with status 404
 */
const notFound = (msg = "Not Found"): AppError => {
  const error: AppError = new Error(msg);
  error.status = 404;
  return error;
};

/**
 * Creates a 401 Authentication Error
 * @param {string} [msg="Authentication failed"] - Error message
 * @returns {AppError} Error object with status 401
 */
const authenticationError = (msg = "Authentication failed"): AppError => {
  const error: AppError = new Error(msg);
  error.status = 401;
  return error;
};

/**
 * Creates a 403 Authorization Error
 * @param {string} [msg="Permission denied"] - Error message
 * @returns {AppError} Error object with status 403
 */
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
