"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '../atoms/Button';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { GraduationCap, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { username, password });
      const { token, user } = response.data;
      
      setAuth(user, token);
      
      document.cookie = `token=${token}; path=/; max-age=86400`; 
      document.cookie = `role=${user.role}; path=/; max-age=86400`;

      let redirectUrl = '/';
      switch(user.role) {
        case 'SUPER_ADMIN': redirectUrl = '/admin/dashboard'; break;
        case 'SUB_ADMIN': {
          redirectUrl = user.customRole?.permissions?.[0] || '/admin/dashboard';
          break;
        }
        case 'STUDENT': redirectUrl = '/student/dashboard'; break;
        case 'TEACHER': redirectUrl = '/teacher/dashboard'; break;
        case 'PARENT': redirectUrl = '/parent/dashboard'; break;
        default: redirectUrl = '/';
      }
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
        {/* Top soft accent gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600"></div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 transform -rotate-3 hover:rotate-0 transition-transform duration-300 border border-indigo-400/30">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">EduERP School Portal</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/50 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
              {error}
            </motion.div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2" htmlFor="username">
              Username / Login ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="username"
                type="text"
                placeholder="Enter your username or ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/60 text-sm outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all font-medium text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/60 text-sm outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all font-medium text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          
          <div className="pt-2">
            <Button type="submit" disabled={loading} size="lg" className="w-full font-bold flex items-center justify-center gap-2">
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors">
            ← Back to Home
          </Link>
          <div className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure Encrypted</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

