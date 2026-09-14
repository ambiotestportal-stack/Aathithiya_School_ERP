import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 
    | 'primary' 
    | 'secondary' 
    | 'success' 
    | 'warning' 
    | 'danger' 
    | 'purple' 
    | 'cyan' 
    | 'sky' 
    | 'soft-indigo' 
    | 'soft-emerald' 
    | 'soft-amber' 
    | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  ...props 
}) => {
  const sizeClasses = {
    sm: 'py-2 px-3.5 text-xs rounded-xl gap-1.5 font-semibold',
    md: 'py-2.5 px-5 text-sm rounded-2xl gap-2 font-bold',
    lg: 'py-3.5 px-6 text-base rounded-2xl gap-2.5 font-extrabold'
  };

  const baseClasses = 'focus:outline-none transition-all duration-200 flex items-center justify-center cursor-pointer select-none border tracking-wide';
  
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg shadow-indigo-500/25 border-indigo-400/20',
    secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-200/80 dark:hover:bg-slate-700',
    success: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25 border-emerald-400/20',
    warning: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 border-amber-400/20',
    danger: 'bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-lg shadow-rose-500/25 border-rose-400/20',
    purple: 'bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white shadow-lg shadow-purple-500/25 border-purple-400/20',
    cyan: 'bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25 border-cyan-400/20',
    sky: 'bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white shadow-lg shadow-sky-500/25 border-sky-400/20',
    'soft-indigo': 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 shadow-sm',
    'soft-emerald': 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 shadow-sm',
    'soft-amber': 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 shadow-sm',
    ghost: 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
  };

  return (
    <motion.button 
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.96 }}
      className={`${baseClasses} ${sizeClasses[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};


