import AppError from './AppError.js';

class NotFoundError extends AppError {
  constructor(message) {
    super(message || 'Resource not found', 404);
  }
}

export default NotFoundError;
