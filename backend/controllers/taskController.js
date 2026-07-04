import * as taskService from '../services/taskService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createTask = asyncHandler(async (req, res, next) => {
  const task = await taskService.createTask(req.user._id, req.body);
  res.status(201).json({
    status: 'success',
    data: {
      task
    }
  });
});

export const getTasks = asyncHandler(async (req, res, next) => {
  const { search, status, priority, sortBy, page, limit } = req.query;
  const result = await taskService.getTasks(req.user._id, {
    search,
    status,
    priority,
    sortBy,
    page,
    limit
  });
  
  res.status(200).json({
    status: 'success',
    ...result
  });
});

export const getTask = asyncHandler(async (req, res, next) => {
  const task = await taskService.getTaskById(req.user._id, req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      task
    }
  });
});

export const updateTask = asyncHandler(async (req, res, next) => {
  const task = await taskService.updateTask(req.user._id, req.params.id, req.body);
  res.status(200).json({
    status: 'success',
    data: {
      task
    }
  });
});

export const deleteTask = asyncHandler(async (req, res, next) => {
  const result = await taskService.deleteTask(req.user._id, req.params.id);
  res.status(200).json({
    status: 'success',
    message: result.message
  });
});

export const getStatistics = asyncHandler(async (req, res, next) => {
  const statistics = await taskService.getStatistics(req.user._id);
  res.status(200).json({
    status: 'success',
    data: {
      statistics
    }
  });
});
