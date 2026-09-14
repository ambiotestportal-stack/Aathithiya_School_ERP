"use client";

import React, { useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { X } from 'lucide-react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { isPositiveNumber, isValidPhone } from '@/lib/validation';

interface TransportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TransportModal = ({ isOpen, onClose, onSuccess }: TransportModalProps) => {
  const [formData, setFormData] = useState({
    busNumber: '', vehicleNumber: '', driverName: '', driverContact: '', route: '', capacity: 40
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.vehicleNumber || !formData.vehicleNumber.trim()) {
      setError('Vehicle number is required');
      return;
    }

    if (!formData.route || !formData.route.trim()) {
      setError('Route details are required');
      return;
    }

    const numCapacity = Number(formData.capacity);
    if (!isPositiveNumber(numCapacity)) {
      setError('Seating capacity must be at least 1');
      return;
    }

    if (formData.driverContact && !isValidPhone(formData.driverContact)) {
      setError('Please provide a valid driver contact phone number (7-15 digits)');
      return;
    }

    setLoading(true);
    
    try {
      await api.post('/api/transport', {
        ...formData,
        busNumber: formData.busNumber.trim(),
        vehicleNumber: formData.vehicleNumber.trim(),
        driverName: formData.driverName.trim(),
        driverContact: formData.driverContact.trim(),
        route: formData.route.trim(),
        capacity: numCapacity
      });
      onSuccess();
      onClose();
      setFormData({ busNumber: '', vehicleNumber: '', driverName: '', driverContact: '', route: '', capacity: 40 });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add vehicle');
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
              <h3 className="text-xl font-bold">Add Transport Vehicle</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-6">
              {error && <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded-xl border border-red-100">{error}</div>}
              <form id="transport-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Bus No (e.g. 33, 44)" id="busNumber" value={formData.busNumber} onChange={handleChange} required placeholder="e.g. 33" />
                  <Input label="Vehicle Number" id="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} required placeholder="e.g. MH-12-AB-1234" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Driver Name" id="driverName" value={formData.driverName} onChange={handleChange} required placeholder="Driver's Full Name" />
                  <Input label="Driver Contact" id="driverContact" value={formData.driverContact} onChange={handleChange} required placeholder="Phone Number" />
                </div>
                <Input label="Route Details" id="route" value={formData.route} onChange={handleChange} required placeholder="e.g. Downtown - School via Main St" />
                <Input label="Seating Capacity" id="capacity" type="number" value={formData.capacity} onChange={handleChange} required />
              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50/50 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button form="transport-form" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add Vehicle'}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
