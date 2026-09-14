"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { X, Plus, Trash2, Calendar } from 'lucide-react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { isDateRangeValid } from '@/lib/validation';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'create' | 'edit';
  initialData?: any;
}

export const ExamModal = ({ isOpen, onClose, onSuccess, mode = 'create', initialData }: ExamModalProps) => {
  const [formData, setFormData] = useState({
    name: '', description: '', startDate: '', endDate: '', status: 'Upcoming'
  });
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<{ date: string; subject: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        api.get('/api/academic/classes'),
        api.get('/api/academic/subjects')
      ]).then(([classRes, subRes]) => {
        setClasses(classRes.data);
        setSubjects(subRes.data);
      }).catch(console.error);

      if (initialData && mode === 'edit') {
        setFormData({
          name: initialData.name || '',
          description: initialData.description || '',
          startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
          endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
          status: initialData.status || 'Upcoming'
        });
        setSelectedClasses((initialData.enrolledClasses || []).map((c: any) => c._id || c));
        setSchedule((initialData.schedule || []).map((s: any) => ({
          date: s.date ? new Date(s.date).toISOString().split('T')[0] : '',
          subject: s.subject?._id || s.subject
        })));
      } else {
        setFormData({ name: '', description: '', startDate: '', endDate: '', status: 'Upcoming' });
        setSelectedClasses([]);
        setSchedule([]);
      }
    }
  }, [isOpen, initialData, mode]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleClassToggle = (id: string) => {
    setSelectedClasses(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleAddScheduleRow = () => {
    setSchedule(prev => [...prev, { date: formData.startDate || '', subject: '' }]);
  };

  const handleRemoveScheduleRow = (index: number) => {
    setSchedule(prev => prev.filter((_, i) => i !== index));
  };

  const handleScheduleChange = (index: number, field: 'date' | 'subject', value: string) => {
    setSchedule(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.name.trim()) {
      setError('Exam name is required');
      return;
    }

    if (!formData.startDate || !formData.endDate || !isDateRangeValid(formData.startDate, formData.endDate)) {
      setError('Start date must be before or equal to end date');
      return;
    }

    setLoading(true);
    try {
      const validSchedule = schedule.filter(s => s.date && s.subject);
      const payload = { 
        ...formData, 
        name: formData.name.trim(),
        enrolledClasses: selectedClasses,
        schedule: validSchedule
      };

      if (mode === 'edit' && initialData?._id) {
        await api.put(`/api/exams/${initialData._id}`, payload);
      } else {
        await api.post('/api/exams', payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between bg-gray-50/50 shrink-0">
              <h3 className="text-xl font-bold">{mode === 'edit' ? 'Edit Exam & Schedule' : 'Create New Exam'}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-200">
                  {error}
                </div>
              )}
              <form id="exam-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Exam Name" id="name" placeholder="e.g. Mid-Term 2026, Unit 2" value={formData.name} onChange={handleChange} required />
                  <div className="flex flex-col justify-end">
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Status</label>
                    <select id="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none">
                      <option value="Upcoming">Upcoming</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <Input label="Start Date" id="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
                  <Input label="End Date" id="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">Description (Optional)</label>
                  <textarea id="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none" rows={2}></textarea>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Applicable Classes</label>
                  <div className="grid grid-cols-3 gap-2 max-h-[140px] overflow-y-auto p-1 border rounded-xl bg-slate-50/50">
                    {classes.map(c => (
                      <label key={c._id} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer bg-white hover:bg-slate-50 text-xs font-semibold">
                        <input type="checkbox" checked={selectedClasses.includes(c._id)} onChange={() => handleClassToggle(c._id)} className="rounded text-blue-600 focus:ring-blue-500" />
                        <span className="text-slate-700">{c.name} - {c.section}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Exam Timetable / Schedule Section */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-blue-600" /> Exam Timetable / Schedule
                      </h4>
                      <p className="text-xs text-slate-500">Add dates and corresponding subjects for this exam.</p>
                    </div>
                    <Button type="button" variant="secondary" onClick={handleAddScheduleRow} className="text-xs px-3 py-1.5 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add Subject Date
                    </Button>
                  </div>

                  {schedule.length === 0 ? (
                    <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed text-slate-400 text-xs">
                      No schedule added yet. Click "+ Add Subject Date" to schedule exam subjects.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {schedule.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border">
                          <input 
                            type="date" 
                            value={item.date} 
                            onChange={(e) => handleScheduleChange(idx, 'date', e.target.value)} 
                            className="px-3 py-1.5 rounded-lg border bg-white text-sm outline-none w-1/2"
                            required
                          />
                          <select 
                            value={item.subject} 
                            onChange={(e) => handleScheduleChange(idx, 'subject', e.target.value)} 
                            className="px-3 py-1.5 rounded-lg border bg-white text-sm outline-none w-1/2"
                            required
                          >
                            <option value="">-- Choose Subject --</option>
                            {subjects.map(s => (
                              <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                            ))}
                          </select>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveScheduleRow(idx)} 
                            className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50/50 flex justify-end gap-3 shrink-0">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button form="exam-form" type="submit" disabled={loading}>{loading ? 'Saving...' : mode === 'edit' ? 'Update Exam' : 'Create Exam'}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
