import { body } from 'express-validator';
import validate from '../middleware/validationMiddleware.js';

export const taskValidator = validate([
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Task description is required'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High']).withMessage('Priority must be one of: Low, Medium, High'),
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed']).withMessage('Status must be one of: Pending, In Progress, Completed'),
  body('dueDate')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Please provide a valid ISO8601 date (YYYY-MM-DD)')
]);

export const taskUpdateValidator = validate([
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty().withMessage('Description cannot be empty'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High']).withMessage('Priority must be one of: Low, Medium, High'),
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed']).withMessage('Status must be one of: Pending, In Progress, Completed'),
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Please provide a valid ISO8601 date')
]);
