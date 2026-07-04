import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Retrieve token from Authorization header or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    return next(new UnauthorizedError('Not authorized to access this resource'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database, excluding password
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new UnauthorizedError('The user belonging to this token no longer exists'));
    }

    // Attach user payload to request
    req.user = user;
    next();
  } catch (error) {
    return next(new UnauthorizedError('Not authorized, token validation failed'));
  }
});
