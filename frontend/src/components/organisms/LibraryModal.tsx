"use client";

import React, { useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { X } from 'lucide-react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { isPositiveNumber } from '@/lib/validation';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LibraryModal = ({ isOpen, onClose, onSuccess }: LibraryModalProps) => {
  const [formData, setFormData] = useState({
    title: '', author: '', isbn: '', category: '', totalCopies: 1
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.title.trim()) {
      setError('Book title is required');
      return;
    }

    if (!formData.author || !formData.author.trim()) {
      setError('Author name is required');
      return;
    }

    if (!formData.isbn || !formData.isbn.trim()) {
      setError('ISBN number is required');
      return;
    }

    const numCopies = Number(formData.totalCopies);
    if (!isPositiveNumber(numCopies)) {
      setError('Total copies must be at least 1');
      return;
    }

    setLoading(true);
    
    try {
      await api.post('/api/library', {
        ...formData,
        title: formData.title.trim(),
        author: formData.author.trim(),
        isbn: formData.isbn.trim(),
        category: formData.category ? formData.category.trim() : 'General',
        totalCopies: numCopies
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add book');
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
              <h3 className="text-xl font-bold">Add Library Book</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-6">
              {error && <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded-xl border border-red-100">{error}</div>}
              <form id="library-form" onSubmit={handleSubmit} className="space-y-4">
                <Input label="Book Title" id="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Introduction to Physics" />
                <Input label="Author" id="author" value={formData.author} onChange={handleChange} required />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="ISBN Number" id="isbn" value={formData.isbn} onChange={handleChange} required />
                  <Input label="Category" id="category" value={formData.category} onChange={handleChange} required placeholder="e.g. Science" />
                </div>
                <Input label="Total Copies" id="totalCopies" type="number" value={formData.totalCopies} onChange={handleChange} required min={1} />
              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50/50 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button form="library-form" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add Book'}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
