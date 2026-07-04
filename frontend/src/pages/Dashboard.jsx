import React, { useState, useEffect, useCallback, useRef } from 'react';
import API from '../api/api.js';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  PlusSquare, 
  Search, 
  Trash2, 
  Edit, 
  Calendar, 
  TrendingUp, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Filter, 
  Info,
  X 
} from 'lucide-react';
import toast from 'react-hot-toast';

// Corrected: removed bogus z.zodSchema guard — z.zodSchema is always undefined
const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().trim().min(1, 'Description is required'),
  priority: z.enum(['Low', 'Medium', 'High']),
  status: z.enum(['Pending', 'In Progress', 'Completed']),
  dueDate: z.string().min(1, 'Due date is required')
});

// Debounce hook to avoid excessive API calls on every keystroke
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    completionPercentage: 0
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    limit: 6
  });

  // Query states
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Pending',
      dueDate: ''
    }
  });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/tasks', {
        params: {
          search: debouncedSearch,
          status: statusFilter,
          priority: priorityFilter,
          sortBy,
          page,
          limit: 6
        }
      });
      setTasks(res.data.tasks || []);
      setPagination(res.data.pagination || { currentPage: 1, totalPages: 1, totalTasks: 0, limit: 6 });
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, priorityFilter, sortBy, page]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await API.get('/tasks/statistics');
      if (res.data?.data?.statistics) {
        setStats(res.data.data.statistics);
      }
    } catch (err) {
      console.error('Failed to fetch statistics', err);
    }
  }, []);

  // Fetch tasks whenever filters or page change
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Fetch stats independently — only refresh after a mutation, not on every tasks render
  // Initial load + refetch triggered explicitly after create/edit/delete
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Reset to page 1 when search changes (debounced)
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, priorityFilter, sortBy]);

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    reset({
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Pending',
      dueDate: new Date().toISOString().split('T')[0]
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setValue('title', task.title);
    setValue('description', task.description);
    setValue('priority', task.priority);
    setValue('status', task.status);
    setValue('dueDate', task.dueDate ? task.dueDate.split('T')[0] : '');
    setIsFormModalOpen(true);
  };

  const onSubmitForm = async (data) => {
    try {
      if (editingTask) {
        await API.put(`/tasks/${editingTask._id}`, data);
        toast.success('Task updated!');
      } else {
        await API.post('/tasks', data);
        toast.success('Task created!');
      }
      setIsFormModalOpen(false);
      fetchTasks();
      fetchStats(); // refresh stats after mutation
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving task');
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTaskId) return;
    setIsDeleting(true);
    try {
      await API.delete(`/tasks/${deletingTaskId}`);
      toast.success('Task deleted successfully');
      setDeletingTaskId(null);
      fetchTasks();
      fetchStats(); // refresh stats after deletion
    } catch (err) {
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeFormModal = () => setIsFormModalOpen(false);
  const closeDeleteModal = () => setDeletingTaskId(null);

  return (
    <div className="space-y-8">
      {/* Welcome header & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks Workspace</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Keep track of your projects, schedules, and task lists.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm shadow-md shadow-green-500/10 active:scale-95 transition-all"
          aria-label="Add new task"
        >
          <PlusSquare className="mr-2 h-4 w-4" aria-hidden="true" />
          Add New Task
        </button>
      </div>

      {/* Dynamic Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4" role="region" aria-label="Task statistics">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold">{stats.total}</span>
            <CheckSquare className="h-5 w-5 text-indigo-500 bg-indigo-500/10 p-1 rounded" aria-hidden="true" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-green-500">{stats.completed}</span>
            <CheckSquare className="h-5 w-5 text-green-500 bg-green-500/10 p-1 rounded" aria-hidden="true" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-amber-500">{stats.inProgress}</span>
            <Clock className="h-5 w-5 text-amber-500 bg-amber-500/10 p-1 rounded" aria-hidden="true" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-slate-500">{stats.pending}</span>
            <AlertCircle className="h-5 w-5 text-slate-500 bg-slate-500/10 p-1 rounded" aria-hidden="true" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between col-span-2 md:col-span-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completion Rate</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-green-500">{stats.completionPercentage}%</span>
            <TrendingUp className="h-5 w-5 text-green-500 bg-green-500/10 p-1 rounded" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400" aria-hidden="true">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="search"
            placeholder="Search tasks..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="block w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 dark:text-white"
            aria-label="Search tasks"
          />
        </div>

        {/* Select Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-1.5 pl-2 pr-8 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-500/40 dark:text-slate-300"
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-1.5 pl-2 pr-8 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-500/40 dark:text-slate-300"
            aria-label="Filter by priority"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-1.5 pl-2 pr-8 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-500/40 dark:text-slate-300"
            aria-label="Sort tasks"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading tasks">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl animate-pulse space-y-3">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
              <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded w-2/3"></div>
              <div className="flex gap-4 pt-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-slate-800/80 rounded-2xl py-16 px-4 text-center">
          <div className="inline-flex justify-center items-center h-12 w-12 rounded-xl bg-green-500/10 text-green-500 mb-4 ring-1 ring-green-500/20" aria-hidden="true">
            <Info className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold">No tasks found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto text-sm">
            Try adjusting your search terms or filters, or create a brand new task.
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="mt-5 inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl text-white bg-green-500 hover:bg-green-600 transition-all"
          >
            Create Your First Task
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => {
              const overdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';
              return (
                <article
                  key={task._id}
                  className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-green-500/30 p-5 rounded-2xl shadow-sm transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                        task.priority === 'High' 
                          ? 'bg-red-500/15 text-red-500' 
                          : task.priority === 'Medium' 
                            ? 'bg-amber-500/15 text-amber-500' 
                            : 'bg-green-500/15 text-green-500'
                      }`}>
                        {task.priority} Priority
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                        task.status === 'Completed' 
                          ? 'bg-green-500/15 text-green-500' 
                          : task.status === 'In Progress' 
                            ? 'bg-blue-500/15 text-blue-500'
                            : 'bg-slate-400/15 text-slate-500'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold my-1 dark:text-white truncate">
                      {task.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mt-1">
                      {task.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-4">
                    <span className={`flex items-center text-[11px] ${overdue ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                      <Calendar className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                      Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                      {overdue && ' (Overdue)'}
                    </span>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(task)}
                        className="p-1 text-slate-400 dark:text-slate-500 hover:text-green-500 transition-colors rounded"
                        aria-label={`Edit task: ${task.title}`}
                      >
                        <Edit className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingTaskId(task._id)}
                        className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors rounded"
                        aria-label={`Delete task: ${task.title}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800" role="navigation" aria-label="Pagination">
              <span className="text-xs text-slate-500">
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalTasks} total tasks)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pagination.currentPage <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={pagination.currentPage >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Creation / Editing Modal Form */}
      {isFormModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"
          role="dialog"
          aria-modal="true"
          aria-label={editingTask ? 'Edit task' : 'Create new task'}
        >
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 max-w-lg w-full rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold">
                {editingTask ? 'Edit Task Details' : 'Create New Task'}
              </h2>
              <button
                type="button"
                onClick={closeFormModal}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4" noValidate>
              <div>
                <label htmlFor="task-title" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Title</label>
                <input
                  id="task-title"
                  type="text"
                  {...register('title')}
                  className={`block w-full py-2 px-3 bg-slate-50 dark:bg-slate-900 border ${
                    errors.title ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-800'
                  } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 dark:text-white`}
                  placeholder="Task Heading"
                />
                {errors.title && <p className="mt-1 text-xs text-red-500" role="alert">{errors.title.message}</p>}
              </div>

              <div>
                <label htmlFor="task-description" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Description</label>
                <textarea
                  id="task-description"
                  rows="3"
                  {...register('description')}
                  className={`block w-full py-2 px-3 bg-slate-50 dark:bg-slate-900 border ${
                    errors.description ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-800'
                  } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 dark:text-white resize-none`}
                  placeholder="Describe your goals..."
                ></textarea>
                {errors.description && <p className="mt-1 text-xs text-red-500" role="alert">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="task-priority" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Priority</label>
                  <select
                    id="task-priority"
                    {...register('priority')}
                    className="block w-full py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="task-status" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Status</label>
                  <select
                    id="task-status"
                    {...register('status')}
                    className="block w-full py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="task-dueDate" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Due Date</label>
                <input
                  id="task-dueDate"
                  type="date"
                  {...register('dueDate')}
                  className={`block w-full py-2 px-3 bg-slate-50 dark:bg-slate-900 border ${
                    errors.dueDate ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-800'
                  } rounded-xl text-sm focus:outline-none dark:text-white`}
                />
                {errors.dueDate && <p className="mt-1 text-xs text-red-500" role="alert">{errors.dueDate.message}</p>}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Delete Confirmation Modal */}
      {deletingTaskId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm task deletion"
        >
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 max-w-sm w-full rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold">Delete Task</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTask}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
