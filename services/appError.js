const appError = (httpStatus, errorMsg, next) => {
  const error = new Error(errorMsg);
  error.statusCode = httpStatus;
  error.isOperational = true;
  return error;
}

module.exports = appError;