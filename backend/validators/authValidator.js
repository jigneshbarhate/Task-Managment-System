import { body } from 'express-validator';
import validate from '../middleware/validationMiddleware.js';

export const registerValidator = validate([
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]);

export const loginValidator = validate([
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
]);

export const changePasswordValidator = validate([
  body('currentPassword')
    .trim()
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .trim()
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
]);

export const profileValidator = validate([
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty if provided')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('avatar')
    .optional()
    .trim()
]);
