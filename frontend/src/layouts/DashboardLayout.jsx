import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { 
  LayoutDashboard, 
  CheckSquare, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon 
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Profile Settings', href: '/profile', icon: User }
  ];

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 flex transition-colors duration-200">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 mb-6">
            <CheckSquare className="h-8 w-8 text-green-500 mr-2" />
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">
              TaskFlow Pro
            </span>
          </div>
          {/* Nav links */}
          <nav className="mt-5 flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 ${
                    isActive
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-green-500' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        {/* User bar */}
        <div className="flex-shrink-0 flex border-t border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center min-w-0">
              {user?.avatar ? (
                <img
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-green-500/30"
                  src={user.avatar}
                  alt={user.name}
                />
              ) : (
                <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-green-500 text-white font-semibold">
                  {getInitials(user?.name)}
                </span>
              )}
              <div className="ml-3 truncate max-w-[120px]">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Mobile Menu Drawer */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform duration-300 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center">
            <CheckSquare className="h-8 w-8 text-green-500 mr-2" />
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">
              TaskFlow Pro
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-5 flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-green-500' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="flex-shrink-0 flex border-t border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center min-w-0">
              {user?.avatar ? (
                <img
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-green-500/30"
                  src={user.avatar}
                  alt={user.name}
                />
              ) : (
                <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-green-500 text-white font-semibold">
                  {getInitials(user?.name)}
                </span>
              )}
              <div className="ml-3 truncate max-w-[120px]">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main wrapper */}
      <div className="flex flex-col flex-1 min-w-0 md:pl-64">
        {/* Header toolbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme switcher toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-all duration-200 border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-black/20"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-indigo-500 animate-pulse" />
              ) : (
                <Sun className="h-5 w-5 text-amber-400 animate-spin-slow" />
              )}
            </button>
          </div>
        </header>

        {/* Page Inner Content */}
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
