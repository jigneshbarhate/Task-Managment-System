import * as authService from '../services/authService.js';
import asyncHandler from '../utils/asyncHandler.js';

const sendTokenResponse = (user, statusCode, res) => {
  const token = authService.generateToken(user.id || user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE || '1') * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      status: 'success',
      token,
      data: {
        user
      }
    });
};

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await authService.registerUser({ name, email, password });
  sendTokenResponse(user, 201, res);
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await authService.loginUser({ email, password });
  sendTokenResponse(user, 200, res);
});

export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.status(200).json({
    status: 'success',
    message: 'User logged out successfully'
  });
});

export const getMe = asyncHandler(async (req, res, next) => {
  const user = {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar
  };

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, avatar } = req.body;
  const user = await authService.updateUserProfile(req.user._id, { name, avatar });
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changeUserPassword(req.user._id, currentPassword, newPassword);
  res.status(200).json({
    status: 'success',
    message: result.message
  });
});
