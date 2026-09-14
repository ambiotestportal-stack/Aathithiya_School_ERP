"use client";

import React, { useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { X } from 'lucide-react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { isDateRangeValid } from '@/lib/validation';

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BatchModal = ({ isOpen, onClose, onSuccess }: BatchModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.name.trim()) {
      setError('Batch name is required');
      return;
    }

    if (!formData.startDate || !formData.endDate || !isDateRangeValid(formData.startDate, formData.endDate)) {
      setError('Start date must be before or equal to end date');
      return;
    }

    setLoading(true);
    
    try {
      await api.post('/api/batches', {
        ...formData,
        name: formData.name.trim()
      });
      onSuccess();
      onClose();
      setFormData({ name: '', startDate: '', endDate: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

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
            <div className="px-6 py-4 border-b flex justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold">Add New Batch</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-6">
              {error && <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded-xl border border-red-100">{error}</div>}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Batch Name (e.g. 2024-2025)" id="name" value={formData.name} onChange={handleChange} required />
                <Input label="Start Date" id="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
                <Input label="End Date" id="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
                
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                  <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create Batch'}</Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
