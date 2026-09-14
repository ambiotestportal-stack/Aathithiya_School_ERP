import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, id, error, icon, className = '', ...props }) => {
  return (
    <div className={`mb-5 ${className}`}>
      <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2" htmlFor={id}>
        {label}
      </label>
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-4 text-slate-400 dark:text-slate-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`w-full ${icon ? 'pl-11' : 'px-4'} py-3 rounded-2xl border text-sm text-slate-900 dark:text-slate-100 bg-slate-100/60 dark:bg-slate-800/60 transition-all duration-200 outline-none
            ${error 
              ? 'border-rose-400/80 focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500' 
              : 'border-slate-200/80 dark:border-slate-700/70 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          id={id}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
};

