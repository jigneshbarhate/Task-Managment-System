import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { CheckSquare, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Please provide a valid email'),
  password: z.string().trim().min(6, 'Password must be at least 6 characters')
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const { register: registerField, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data) => {
    setIsSubmittingForm(true);
    try {
      const success = await login(data.email, data.password, rememberMe);
      if (success) {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 bg-white/80 dark:bg-[#111827]/85 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80 p-8 rounded-2xl shadow-xl shadow-black/10">
        
        {/* Brand logo header */}
        <div className="text-center">
          <div className="inline-flex justify-center items-center h-12 w-12 rounded-xl bg-green-500/10 text-green-500 mb-4 ring-1 ring-green-500/20">
            <CheckSquare className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Log in to manage your tasks with{' '}
            <span className="font-semibold text-green-500">TaskFlow Pro</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            
            {/* Email input field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...registerField('email')}
                  className={`block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border ${
                    errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-800'
                  } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 dark:text-white transition-all`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password input field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...registerField('password')}
                  className={`block w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-900 border ${
                    errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-800'
                  } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 dark:text-white transition-all`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Remember me toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-slate-300 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900 cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-650 dark:text-slate-405 user-select-none cursor-pointer">
                Remember my login
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmittingForm}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 hover:shadow-green-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingForm ? 'Logging in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-green-500 hover:text-green-600 transition-colors">
            Register for Free
          </Link>
        </p>

      </div>
    </div>
  );
}
