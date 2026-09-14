"use client";

import React, { useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { X } from 'lucide-react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { isPositiveNumber } from '@/lib/validation';

interface HostelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const HostelModal = ({ isOpen, onClose, onSuccess }: HostelModalProps) => {
  const [formData, setFormData] = useState({
    roomNumber: '', blockName: '', roomType: 'Boys', capacity: 2, wardenName: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.roomNumber || !formData.roomNumber.trim()) {
      setError('Room number is required');
      return;
    }

    if (!formData.blockName || !formData.blockName.trim()) {
      setError('Block name is required');
      return;
    }

    const numCapacity = Number(formData.capacity);
    if (!isPositiveNumber(numCapacity)) {
      setError('Room capacity must be at least 1');
      return;
    }

    if (!formData.wardenName || !formData.wardenName.trim()) {
      setError('Warden name is required');
      return;
    }

    setLoading(true);
    
    try {
      await api.post('/api/hostels', {
        ...formData,
        roomNumber: formData.roomNumber.trim(),
        blockName: formData.blockName.trim(),
        capacity: numCapacity,
        wardenName: formData.wardenName.trim()
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative z-10 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold">Add Hostel Room</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-6">
              {error && <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded-xl border border-red-100">{error}</div>}
              <form id="hostel-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Room Number" id="roomNumber" value={formData.roomNumber} onChange={handleChange} required placeholder="e.g. 101" />
                  <Input label="Block Name" id="blockName" value={formData.blockName} onChange={handleChange} required placeholder="e.g. Block A" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Room Type</label>
                    <select id="roomType" value={formData.roomType} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none">
                      <option value="Boys">Boys</option>
                      <option value="Girls">Girls</option>
                    </select>
                  </div>
                  <Input label="Capacity (Beds)" id="capacity" type="number" value={formData.capacity} onChange={handleChange} required min={1} />
                </div>

                <Input label="Warden Name" id="wardenName" value={formData.wardenName} onChange={handleChange} required />
              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50/50 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button form="hostel-form" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add Room'}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
