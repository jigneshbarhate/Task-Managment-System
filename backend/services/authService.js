import User from '../models/User.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import NotFoundError from '../errors/NotFoundError.js';
import ValidationError from '../errors/ValidationError.js';
import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d'
  });
};

export const registerUser = async ({ name, email, password }) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ValidationError('A user with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new UnauthorizedError('Invalid email or password');
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar
  };
};

export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new UnauthorizedError('Incorrect current password');
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Password changed successfully' };
};

export const updateUserProfile = async (userId, { name, avatar }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (name) user.name = name;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar
  };
};
