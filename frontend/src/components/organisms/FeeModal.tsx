"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { X, Users, User, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { isPositiveNumber, isValidDate } from '@/lib/validation';

interface FeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const FeeModal = ({ isOpen, onClose, onSuccess }: FeeModalProps) => {
  const [targetType, setTargetType] = useState<'class' | 'student'>('class');
  const [selectedClassName, setSelectedClassName] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [showStudentSelect, setShowStudentSelect] = useState(false);

  const [formData, setFormData] = useState({
    amount: '', dueDate: '', remarks: ''
  });

  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        api.get('/api/academic/classes'),
        api.get('/api/students')
      ]).then(([classRes, studentRes]) => {
        setClasses(classRes.data);
        setStudents(studentRes.data);
      }).catch(console.error);
    }
  }, [isOpen]);

  // Extract unique class names (without section)
  const uniqueClassNames = Array.from(new Set(classes.map(c => c.name)));

  // Filter students based on selected class name (across all sections)
  const filteredStudents = selectedClassName 
    ? students.filter(s => s.enrolledClass?.name?.toLowerCase() === selectedClassName.toLowerCase())
    : students;

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = Number(formData.amount);
    if (!isPositiveNumber(numAmount)) {
      setError('Fee amount must be greater than 0');
      return;
    }

    if (!formData.dueDate || !isValidDate(formData.dueDate)) {
      setError('Please provide a valid due date');
      return;
    }

    if (!showStudentSelect && targetType === 'class') {
      if (!selectedClassName) {
        setError('Please select a class');
        return;
      }
    } else {
      if (!selectedStudent) {
        setError('Please select a student');
        return;
      }
    }

    setLoading(true);

    try {
      const payload: any = {
        amount: numAmount,
        dueDate: formData.dueDate,
        remarks: formData.remarks?.trim() || 'Tuition Fee'
      };

      if (!showStudentSelect && targetType === 'class') {
        payload.className = selectedClassName;
      } else {
        payload.student = selectedStudent;
      }

      await api.post('/api/finance/fees', payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign fee');
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
              <h3 className="text-xl font-bold">Assign Fee</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-200">
                  {error}
                </div>
              )}
              <form id="fee-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Target Type Mode */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">Assign Fee To</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => { setTargetType('class'); setShowStudentSelect(false); setSelectedStudent(''); }}
                      className={`flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${targetType === 'class' && !showStudentSelect ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Users className="w-4 h-4" /> Entire Class
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTargetType('student'); setShowStudentSelect(true); }}
                      className={`flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${showStudentSelect ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <User className="w-4 h-4" /> Single Student
                    </button>
                  </div>
                </div>

                {/* Select Class Dropdown (Class wise, not section wise) */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">Select Class</label>
                  <select 
                    value={selectedClassName} 
                    onChange={(e) => {
                      setSelectedClassName(e.target.value);
                      setSelectedStudent('');
                    }} 
                    className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none"
                    required
                  >
                    <option value="">-- Choose Class --</option>
                    {uniqueClassNames.map(name => (
                      <option key={name} value={name}>
                        {name.toLowerCase().startsWith('class') ? name : `Class ${name}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show / Hide Student List Button */}
                <div className="flex items-center justify-between pt-1 pb-1">
                  <span className="text-xs text-slate-500 font-medium">
                    {showStudentSelect 
                      ? "Assigning to a specific student in this class" 
                      : "Assigning fee to ALL sections of this class"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !showStudentSelect;
                      setShowStudentSelect(nextState);
                      if (nextState) setTargetType('student');
                      else setTargetType('class');
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {showStudentSelect ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showStudentSelect ? "Hide Student List" : "Show Student List"}
                  </button>
                </div>

                {/* Student Dropdown */}
                {showStudentSelect && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Select Student</label>
                    <select 
                      value={selectedStudent} 
                      onChange={(e) => setSelectedStudent(e.target.value)} 
                      className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none"
                      required={showStudentSelect}
                    >
                      <option value="">-- Choose Student --</option>
                      {filteredStudents.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.user?.name} (Sec {s.enrolledClass?.section || 'N/A'}, Roll: {s.rollNumber || 'N/A'})
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Amount ($)" id="amount" type="number" value={formData.amount} onChange={handleChange} required />
                  <Input label="Due Date" id="dueDate" type="date" value={formData.dueDate} onChange={handleChange} required />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">Remarks (Optional)</label>
                  <textarea id="remarks" value={formData.remarks} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none" rows={2} placeholder="e.g. Tuition Fee Term 1"></textarea>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50/50 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button form="fee-form" type="submit" disabled={loading}>{loading ? 'Assigning...' : 'Assign Fee'}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
