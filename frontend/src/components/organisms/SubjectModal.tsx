"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { X } from 'lucide-react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'add' | 'edit' | 'view';
  initialData?: any;
}

export const SubjectModal = ({ isOpen, onClose, onSuccess, mode = 'add', initialData = null }: SubjectModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'Theory',
    assignedClass: ''
  });
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isReadOnly = mode === 'view';

  useEffect(() => {
    if (isOpen) {
      api.get('/api/academic/classes').then(res => setClasses(res.data)).catch(console.error);

      if ((mode === 'edit' || mode === 'view') && initialData) {
        setFormData({
          name: initialData.name || '',
          code: initialData.code || '',
          type: initialData.type || 'Theory',
          assignedClass: initialData.assignedClass?._id || initialData.assignedClass || ''
        });
      } else {
        setFormData({ name: '', code: '', type: 'Theory', assignedClass: '' });
      }
      setError('');
    }
  }, [isOpen, mode, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    setError('');

    if (!formData.name || !formData.name.trim()) {
      setError('Subject name is required');
      return;
    }

    if (!formData.code || !formData.code.trim()) {
      setError('Subject code is required');
      return;
    }

    setLoading(true);
    
    try {
      const payload = { 
        ...formData, 
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        assignedClass: formData.assignedClass || null 
      };
      if (mode === 'add') {
        await api.post('/api/academic/subjects', payload);
      } else if (mode === 'edit') {
        await api.put(`/api/academic/subjects/${initialData._id}`, payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${mode} subject`);
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'view' ? 'View Subject Details' : mode === 'edit' ? 'Edit Subject' : 'Add New Subject';
  const submitLabel = mode === 'edit' ? 'Update Subject' : 'Create Subject';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative z-10 overflow-hidden"
          >
            <div className="px-6 py-4 border-b flex justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold">{title}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-6">
              {error && <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded-xl border border-red-100">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <Input label="Subject Name (e.g. Mathematics)" id="name" value={formData.name} onChange={handleChange} required disabled={isReadOnly} />
                <Input label="Subject Code (e.g. MATH101)" id="code" value={formData.code} onChange={handleChange} required disabled={isReadOnly} />
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1.5" htmlFor="type">Subject Type</label>
                  <select
                    id="type"
                    className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    value={formData.type}
                    onChange={handleChange}
                    disabled={isReadOnly}
                  >
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-1.5" htmlFor="assignedClass">Assigned Class (Optional)</label>
                  <select
                    id="assignedClass"
                    className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    value={formData.assignedClass}
                    onChange={handleChange}
                    disabled={isReadOnly}
                  >
                    <option value="">Select a Class</option>
                    {Array.from(new Map(classes.map(c => [c.name, c])).values()).map((c: any) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={onClose}>{isReadOnly ? 'Close' : 'Cancel'}</Button>
                  {!isReadOnly && (
                    <Button type="submit" disabled={loading}>{loading ? 'Saving...' : submitLabel}</Button>
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
