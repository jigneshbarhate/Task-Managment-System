import express from 'express';
import * as taskController from '../controllers/taskController.js';
import * as taskValidator from '../validators/taskValidator.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection to all task endpoints
router.use(protect);

// Statistics route must be placed before dynamic /:id route
router.get('/statistics', taskController.getStatistics);

router.route('/')
  .post(taskValidator.taskValidator, taskController.createTask)
  .get(taskController.getTasks);

router.route('/:id')
  .get(taskController.getTask)
  .put(taskValidator.taskUpdateValidator, taskController.updateTask)
  .delete(taskController.deleteTask);

export default router;
