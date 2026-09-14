"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { X, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { isValidEmail, isValidUsername } from '@/lib/validation';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'add' | 'edit' | 'view';
  initialData?: any;
}

export const UserModal = ({ isOpen, onClose, onSuccess, mode = 'add', initialData }: UserModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SUB_ADMIN',
    customRole: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get('/api/roles');
        setAvailableRoles(res.data);
      } catch (err) {
        console.error('Failed to fetch roles', err);
      }
    };
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData && (mode === 'edit' || mode === 'view')) {
        setFormData({
          name: initialData.name || '',
          email: initialData.email || initialData.username || '',
          password: '',
          role: initialData.role || 'SUB_ADMIN',
          customRole: initialData.customRole?._id || initialData.customRole || ''
        });
      } else {
        setFormData({ 
          name: '', 
          email: '', 
          password: '', 
          role: 'SUB_ADMIN', 
          customRole: '' 
        });
      }
    }
  }, [isOpen, initialData, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'SUPER_ADMIN') {
      setFormData({ ...formData, role: 'SUPER_ADMIN', customRole: '' });
    } else {
      setFormData({ ...formData, role: 'SUB_ADMIN', customRole: val });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;
    
    setError('');

    if (!formData.name || formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    if (!formData.email || !isValidEmail(formData.email)) {
      setError('Please enter a valid email address for Login ID');
      return;
    }

    if (mode === 'add' && (!formData.password || formData.password.length < 6)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (mode === 'edit' && formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.role === 'SUB_ADMIN' && !formData.customRole) {
      setError('Please select a role for this Sub-Admin');
      return;
    }

    setLoading(true);
    
    try {
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        username: formData.email.trim().toLowerCase(), // Log ID is email
        role: formData.role,
        customRole: formData.role === 'SUB_ADMIN' ? formData.customRole : undefined
      };
      
      if (formData.password) {
        payload.password = formData.password;
      }

      if (mode === 'add') {
        await api.post('/api/users', payload);
      } else if (mode === 'edit') {
        await api.put(`/api/users/${initialData._id}`, payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${mode} user`);
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === 'view';
  const currentSelectValue = formData.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : (formData.customRole || '');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-0">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative z-10 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">
                {mode === 'add' ? 'Add Sub-Admin' : mode === 'edit' ? 'Edit Sub-Admin' : 'View Sub-Admin'}
              </h3>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded-xl border border-red-100"
                >
                  {error}
                </motion.div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="name">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    disabled={isReadOnly}
                    placeholder="Sub-Admin Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-800 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="email">
                    Email (Login ID)
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    disabled={isReadOnly}
                    placeholder="admin@hackathon.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-800 disabled:bg-slate-100"
                  />
                </div>

                {!isReadOnly && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="password">
                      {mode === 'edit' ? 'Password (leave blank to keep current)' : 'Password'}
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required={mode === 'add'}
                        placeholder={mode === 'edit' ? "Enter new password to update" : "••••••••"}
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {mode === 'edit' && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Existing password is saved and encrypted. Leave blank to keep it unchanged, or type here to set a new password.
                      </p>
                    )}
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="role">
                    Role
                  </label>
                  <select
                    id="role"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none disabled:bg-slate-100 font-medium text-slate-800"
                    value={currentSelectValue}
                    onChange={handleRoleChange}
                    disabled={isReadOnly}
                    required
                  >
                    <option value="" disabled>Select a Role</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    {availableRoles.map(r => (
                      <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="pt-3">
                  {!isReadOnly ? (
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : mode === 'edit' ? 'Save Changes' : '+ Create Sub-Admin'}
                    </button>
                  ) : (
                    <Button type="button" variant="secondary" onClick={onClose} className="w-full">
                      Close
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
