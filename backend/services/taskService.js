import Task from '../models/Task.js';
import NotFoundError from '../errors/NotFoundError.js';
import ForbiddenError from '../errors/ForbiddenError.js';
import mongoose from 'mongoose';

export const createTask = async (userId, taskData) => {
  const task = await Task.create({
    ...taskData,
    userId
  });
  return task;
};

export const getTasks = async (userId, queryOptions) => {
  const { search, status, priority, sortBy, page = 1, limit = 10 } = queryOptions;

  // Build filter object
  const filter = { userId };

  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Setup options for sorting
  let sort = {};
  if (sortBy === 'oldest') {
    sort.createdAt = 1;
  } else if (sortBy === 'dueDate') {
    sort.dueDate = 1;
  } else if (sortBy === 'priority') {
    // Custom sort logic would be best done in DB or JS. For simplicity, we can do priority: -1 or we can map inside JS.
    // Let's sort alphabetically or we'll default to newest first.
    sort.priority = 1; // H, L, M order (standard MongoDB sorting)
  } else {
    sort.createdAt = -1; // default newest
  }

  // Pagination setups
  const pg = parseInt(page);
  const lim = parseInt(limit);
  const skip = (pg - 1) * lim;

  const totalTasks = await Task.countDocuments(filter);
  const tasks = await Task.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(lim);

  return {
    tasks,
    pagination: {
      totalTasks,
      totalPages: Math.ceil(totalTasks / lim),
      currentPage: pg,
      limit: lim
    }
  };
};

export const getTaskById = async (userId, taskId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError('Task not found');
  }

  // Verify ownership
  if (task.userId.toString() !== userId.toString()) {
    throw new ForbiddenError('You do not have permission to access this task');
  }

  return task;
};

export const updateTask = async (userId, taskId, updateData) => {
  const updatedTask = await Task.findOneAndUpdate(
    { _id: taskId, userId },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedTask) {
    throw new NotFoundError('Task not found or you do not have permission to modify it');
  }

  return updatedTask;
};

export const deleteTask = async (userId, taskId) => {
  // Atomic find-and-delete — filter by both _id and userId to prevent TOCTOU race
  const task = await Task.findOneAndDelete({ _id: taskId, userId });

  if (!task) {
    const exists = await Task.exists({ _id: taskId });
    if (!exists) throw new NotFoundError('Task not found');
    throw new ForbiddenError('You do not have permission to delete this task');
  }

  return { message: 'Task deleted successfully' };
};

export const getStatistics = async (userId) => {
  const stats = await Task.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    completionPercentage: 0
  };

  stats.forEach(stat => {
    const count = stat.count;
    result.total += count;
    if (stat._id === 'Completed') result.completed = count;
    if (stat._id === 'Pending') result.pending = count;
    if (stat._id === 'In Progress') result.inProgress = count;
  });

  if (result.total > 0) {
    result.completionPercentage = Math.round((result.completed / result.total) * 100);
  }

  return result;
};
