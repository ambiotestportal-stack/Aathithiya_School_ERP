"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { X, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { isPositiveNumber } from '@/lib/validation';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'add' | 'edit' | 'view';
  initialData?: any;
}

export const ClassModal = ({ isOpen, onClose, onSuccess, mode = 'add', initialData = null }: ClassModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    capacity: 30,
    batch: ''
  });
  const [sections, setSections] = useState<{ section: string; classTeacher: string }[]>([
    { section: 'A', classTeacher: '' }
  ]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [existingClasses, setExistingClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isReadOnly = mode === 'view';

  useEffect(() => {
    if (isOpen) {
      api.get('/api/users').then(res => {
        setTeachers(res.data.filter((u: any) => u.role === 'TEACHER'));
      }).catch(err => console.error(err));
      
      api.get('/api/batches').then(res => {
        setBatches(res.data);
      }).catch(err => console.error(err));

      api.get('/api/academic/classes').then(res => {
        setExistingClasses(res.data);
      }).catch(err => console.error(err));

      if ((mode === 'edit' || mode === 'view') && initialData) {
        setFormData({
          name: initialData.name || '',
          capacity: initialData.capacity || 30,
          batch: initialData.batch?._id || initialData.batch || ''
        });
        setSections([{
          section: initialData.section || 'A',
          classTeacher: initialData.classTeacher?._id || initialData.classTeacher || ''
        }]);
      } else {
        setFormData({ name: '', capacity: 30, batch: '' });
        setSections([{ section: 'A', classTeacher: '' }]);
      }
      setError('');
    }
  }, [isOpen, mode, initialData]);

  // Extract unique class names created so far to offer in dropdown/autocomplete
  const uniqueExistingClassNames = Array.from(new Set(existingClasses.map(c => c.name)));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSectionChange = (index: number, field: 'section' | 'classTeacher', value: string) => {
    setSections(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleAddSectionRow = () => {
    // Generate next section letter e.g., A -> B -> C
    const nextChar = String.fromCharCode(65 + sections.length);
    setSections(prev => [...prev, { section: nextChar, classTeacher: '' }]);
  };

  const handleRemoveSectionRow = (index: number) => {
    if (sections.length === 1) return;
    setSections(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    setError('');

    if (!formData.name || !formData.name.trim()) {
      setError('Class name is required');
      return;
    }

    const numCapacity = Number(formData.capacity);
    if (!isPositiveNumber(numCapacity)) {
      setError('Class capacity must be at least 1');
      return;
    }

    for (let i = 0; i < sections.length; i++) {
      if (!sections[i].section || !sections[i].section.trim()) {
        setError(`Section code is required for section ${i + 1}`);
        return;
      }
    }

    setLoading(true);
    
    try {
      if (mode === 'add') {
        // Create all sections in parallel with error tracking
        const results = await Promise.allSettled(
          sections.map(sec => {
            const payload = {
              name: formData.name.trim(),
              capacity: numCapacity,
              batch: formData.batch || null,
              section: sec.section.trim().toUpperCase(),
              classTeacher: sec.classTeacher || null
            };
            return api.post('/api/academic/classes', payload);
          })
        );
        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length > 0 && failed.length < sections.length) {
          setError(`${sections.length - failed.length} section(s) created, but ${failed.length} failed. Please check and retry.`);
          setLoading(false);
          onSuccess(); // Refresh to show what was created
          return;
        } else if (failed.length === sections.length) {
          throw (failed[0] as PromiseRejectedResult).reason;
        }
      } else if (mode === 'edit') {
        const sec = sections[0];
        const payload = {
          name: formData.name.trim(),
          capacity: numCapacity,
          batch: formData.batch || null,
          section: sec.section.trim().toUpperCase(),
          classTeacher: sec.classTeacher || null
        };
        await api.put(`/api/academic/classes/${initialData._id}`, payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${mode} class`);
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'view' ? 'View Class Details' : mode === 'edit' ? 'Edit Class' : 'Add New Class & Sections';
  const submitLabel = mode === 'edit' ? 'Update Class' : 'Create Class & Sections';

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
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="px-6 py-4 border-b flex justify-between bg-gray-50/50 shrink-0">
              <h3 className="text-xl font-bold">{title}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded-xl border border-red-100">{error}</div>}
              
              <form id="class-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5" htmlFor="batch">Batch (Optional)</label>
                  <select
                    id="batch"
                    className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    value={formData.batch}
                    onChange={handleChange}
                    disabled={isReadOnly}
                  >
                    <option value="">Select a Batch</option>
                    {batches.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5" htmlFor="name">Class Name</label>
                  <input 
                    list="existing-classes"
                    id="name"
                    type="text"
                    placeholder="e.g. Class 1, Class 2, Grade 10"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isReadOnly}
                    className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none disabled:opacity-60"
                  />
                  {uniqueExistingClassNames.length > 0 && (
                    <datalist id="existing-classes">
                      {uniqueExistingClassNames.map((name: any) => (
                        <option key={name} value={name} />
                      ))}
                    </datalist>
                  )}
                  <p className="text-xs text-slate-500 mt-1">Select an existing Class or type a new Class Name.</p>
                </div>

                <Input label="Student Capacity per Section" id="capacity" type="number" value={formData.capacity} onChange={handleChange} required disabled={isReadOnly} />
                
                {/* Sections Section */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Class Sections</h4>
                      <p className="text-xs text-slate-500">Define sections (e.g. A, B, C) for this class.</p>
                    </div>
                    {mode === 'add' && !isReadOnly && (
                      <Button type="button" variant="secondary" onClick={handleAddSectionRow} className="text-xs px-3 py-1.5 flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Add Section
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {sections.map((sec, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-xl border flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                        <div className="w-full sm:w-1/3">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Section Code</label>
                          <input 
                            type="text" 
                            value={sec.section} 
                            onChange={(e) => handleSectionChange(idx, 'section', e.target.value)} 
                            placeholder="A"
                            className="w-full px-3 py-1.5 rounded-lg border bg-white text-sm outline-none font-bold uppercase"
                            required
                            disabled={isReadOnly}
                          />
                        </div>
                        <div className="w-full sm:w-2/3">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Class Teacher (Optional)</label>
                          <select 
                            value={sec.classTeacher} 
                            onChange={(e) => handleSectionChange(idx, 'classTeacher', e.target.value)} 
                            className="w-full px-3 py-1.5 rounded-lg border bg-white text-sm outline-none"
                            disabled={isReadOnly}
                          >
                            <option value="">Select Teacher</option>
                            {teachers.map(t => (
                              <option key={t._id} value={t._id}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                        {mode === 'add' && sections.length > 1 && !isReadOnly && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveSectionRow(idx)} 
                            className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 mt-5 transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50/50 shrink-0 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>{isReadOnly ? 'Close' : 'Cancel'}</Button>
              {!isReadOnly && (
                <Button form="class-form" type="submit" disabled={loading}>{loading ? 'Saving...' : submitLabel}</Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
