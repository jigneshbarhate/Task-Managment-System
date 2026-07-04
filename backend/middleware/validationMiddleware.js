import { validationResult } from 'express-validator';
import ValidationError from '../errors/ValidationError.js';

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validation rules
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));

    next(new ValidationError('Validation input parameters failed', formattedErrors));
  };
};

export default validate;
