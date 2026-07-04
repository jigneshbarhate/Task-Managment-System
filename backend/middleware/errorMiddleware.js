import logger from '../utils/logger.js';

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    logger.error(`${err.message} \n ${err.stack}`);
  } else {
    logger.error(err.message);
  }

  let error = { ...err };
  error.message = err.message;

  if (err.name === 'CastError') {
    error.message = `Invalid ${err.path}: ${err.value}`;
    error.statusCode = 400;
  }

  if (err.code === 11000) {
    const value = Object.keys(err.keyValue || {}).map(k => `${k}: ${err.keyValue[k]}`).join(', ');
    error.message = `Duplicate field value: ${value}. Please use another value!`;
    error.statusCode = 400;
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    error.message = `Invalid input data: ${errors.join('. ')}`;
    error.statusCode = 400;
  }

  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token. Please log in again.';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Your session has expired. Please log in again.';
    error.statusCode = 401;
  }

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    errors: err.errors || undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default globalErrorHandler;
