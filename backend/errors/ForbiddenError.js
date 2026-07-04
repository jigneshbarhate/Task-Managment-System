import AppError from './AppError.js';

class ForbiddenError extends AppError {
  constructor(message) {
    super(message || 'Access Forbidden', 403);
  }
}

export default ForbiddenError;
