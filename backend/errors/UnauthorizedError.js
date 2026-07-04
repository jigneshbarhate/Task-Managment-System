import AppError from './AppError.js';

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message || 'Unauthorized access', 401);
  }
}

export default UnauthorizedError;
