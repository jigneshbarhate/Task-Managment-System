import React from 'react';
import { Link } from 'react-router-dom';
import { Home, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex flex-col justify-center items-center px-6 transition-colors duration-200">
      <div className="text-center max-w-lg">
        {/* Visual Indicator */}
        <p className="text-7xl font-extrabold text-green-500 dark:text-green-400 animate-bounce">
          404
        </p>
        
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Page not found
        </h1>
        
        <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
          Sorry, we couldn’t find the page you’re looking for. It might have been moved or deleted.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-green-500 hover:bg-green-600 shadow-md shadow-green-500/20 active:scale-95 transition-all"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-5 py-3 border border-slate-200 dark:border-slate-800 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
