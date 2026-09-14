"use client";

import React from 'react';
import { Menu, LogOut, User as UserIcon, Search, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';

export const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    document.cookie = 'token=; Max-Age=0; path=/';
    document.cookie = 'role=; Max-Age=0; path=/';
    router.push('/');
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-30 transition-colors shadow-sm">
      <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="p-2.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl lg:hidden transition-colors shadow-sm cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Search Input */}
          <div className="relative hidden md:flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Quick search..."
              className="pl-10 pr-4 py-2 text-xs w-64 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Button */}
          <button className="relative p-2.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/60 rounded-2xl transition-all shadow-sm cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-900"></span>
          </button>

          <ThemeToggle />
          
          <div className="h-6 w-px bg-slate-200/80 dark:bg-slate-800"></div>

          {/* User Profile Card */}
          <div className="flex items-center gap-3 bg-slate-100/60 dark:bg-slate-800/50 p-1.5 pr-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 border border-indigo-400/30 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {user?.customRole?.name || (user?.role === 'SUPER_ADMIN' ? 'Super Admin' : user?.role?.toLowerCase().replace('_', ' '))}
              </p>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 transition-colors cursor-pointer shadow-sm"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </header>
  );
};

