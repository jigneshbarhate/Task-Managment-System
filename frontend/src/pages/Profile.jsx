import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Lock, Mail, Camera, Key } from 'lucide-react';
import toast from 'react-hot-toast';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters')
});

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Tigger',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Buster'
];

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || PRESET_AVATARS[0]);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '' }
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPasswordForm, formState: { errors: passwordErrors } } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
  });

  const onUpdateProfile = async (data) => {
    setIsUpdatingProfile(true);
    try {
      await updateProfile(data.name, selectedAvatar);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    setIsUpdatingPassword(true);
    try {
      const ok = await changePassword(data.currentPassword, data.newPassword);
      if (ok) {
        resetPasswordForm();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details, profile avatar, and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Personal info & avatar selection */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <User className="mr-2 h-5 w-5 text-green-500" />
              Personal Profile
            </h2>

            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-6">
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Choose Avatar Profile
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  {/* Current Selected Large */}
                  <div className="relative">
                    <img
                      src={selectedAvatar}
                      alt="Selected Avatar"
                      className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 ring-4 ring-green-500/20"
                    />
                    <div className="absolute right-0 bottom-0 p-1 bg-green-500 rounded-full text-white ring-2 ring-white dark:ring-[#111827]">
                      <Camera className="h-3 w-3" />
                    </div>
                  </div>

                  {/* Presets List */}
                  <div className="flex flex-wrap gap-2.5">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setSelectedAvatar(av)}
                        aria-label={`Select avatar ${av.split('seed=')[1]}`}
                        aria-pressed={selectedAvatar === av}
                        className={`h-11 w-11 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 ring-2 transition-all ${
                          selectedAvatar === av 
                            ? 'ring-green-500 scale-110 shadow' 
                            : 'ring-transparent hover:ring-slate-300 dark:hover:ring-slate-700'
                        }`}
                      >
                        <img src={av} alt="" className="h-full w-full object-cover" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Profile Details Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <User className="h-5 w-5" />
                    </span>
                    <input
                      id="name"
                      type="text"
                      {...registerProfile('name')}
                      className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border ${
                        profileErrors.name ? 'border-red-500 ring-1' : 'border-slate-200 dark:border-slate-800'
                      } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 dark:text-white transition-all`}
                    />
                  </div>
                  {profileErrors.name && (
                    <p className="mt-1 text-xs text-red-500">{profileErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Registered Email (Read Only)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Mail className="h-5 w-5" />
                    </span>
                    <input
                      id="email"
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 dark:text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-2.5 text-sm font-semibold rounded-xl text-white bg-green-500 hover:bg-green-600 shadow shadow-green-500/10 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Security (Change password) */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <Lock className="mr-2 h-5 w-5 text-green-500" />
              Security Settings
            </h2>

            <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Key className="h-4 w-4" />
                  </span>
                  <input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    {...registerPassword('currentPassword')}
                    className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border ${
                      passwordErrors.currentPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                    } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 dark:text-white transition-all`}
                    placeholder="••••••••"
                  />
                </div>
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-xs text-red-500">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    {...registerPassword('newPassword')}
                    className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border ${
                      passwordErrors.newPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                    } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 dark:text-white transition-all`}
                    placeholder="Min 6 characters"
                  />
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    {...registerPassword('confirmPassword')}
                    className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border ${
                      passwordErrors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                    } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 dark:text-white transition-all`}
                    placeholder="••••••••"
                  />
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full py-2.5 text-sm font-semibold rounded-xl text-white bg-green-500 hover:bg-green-600 transition-all disabled:opacity-50"
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
