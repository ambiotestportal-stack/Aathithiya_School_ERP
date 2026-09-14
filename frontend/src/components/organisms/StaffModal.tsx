"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { X } from 'lucide-react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { isValidEmail, isValidPhone, isNonNegativeNumber } from '@/lib/validation';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'add' | 'edit' | 'view';
  initialData?: any;
}

export const StaffModal = ({ isOpen, onClose, onSuccess, mode = 'add', initialData }: StaffModalProps) => {
  const [formData, setFormData] = useState({
    name: '', email: '',
    employeeId: '', subject: '', department: '', designation: '', 
    joiningDate: '', qualification: '', experienceYears: 0, 
    salary: 0, phone: '', address: '',
    assignedClasses: [] as string[]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        api.get('/api/academic/subjects'),
        api.get('/api/academic/classes')
      ]).then(([subRes, classRes]) => {
        setSubjects(subRes.data);
        setClasses(classRes.data);

        if (initialData && (mode === 'edit' || mode === 'view')) {
          const assignedIds = (initialData.assignedClasses || []).map((c: any) => c._id || c);
          const initialSubId = initialData.subject?._id || initialData.subject || '';
          const foundSub = subRes.data.find((s: any) => s._id === initialSubId || s.name === initialData.department);

          setFormData({
            name: initialData.user?.name || '',
            email: initialData.user?.email || '',
            employeeId: initialData.employeeId || '',
            subject: foundSub?._id || initialSubId || '',
            department: initialData.department || foundSub?.name || '',
            designation: initialData.designation || '',
            joiningDate: initialData.joiningDate ? new Date(initialData.joiningDate).toISOString().split('T')[0] : '',
            qualification: initialData.qualification || '',
            experienceYears: initialData.experienceYears || 0,
            salary: initialData.salary || 0,
            phone: initialData.phone || '',
            address: initialData.address || '',
            assignedClasses: assignedIds
          });
        } else {
          setFormData({
            name: '', email: '', employeeId: '', subject: '', department: '', designation: '', 
            joiningDate: '', qualification: '', experienceYears: 0, salary: 0, phone: '', address: '',
            assignedClasses: []
          });
        }
      }).catch(console.error);
    }
  }, [isOpen, initialData, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleClassToggle = (classId: string) => {
    const isAssigned = formData.assignedClasses.includes(classId);
    const updated = isAssigned 
      ? formData.assignedClasses.filter(id => id !== classId)
      : [...formData.assignedClasses, classId];
    setFormData({ ...formData, assignedClasses: updated });
  };

  const handleSelectAllClasses = () => {
    const allIds = classes.map(c => c._id);
    setFormData(prev => ({ ...prev, assignedClasses: allIds }));
  };

  const handleClearAllClasses = () => {
    setFormData(prev => ({ ...prev, assignedClasses: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;

    setError('');

    if (!formData.name || formData.name.trim().length < 2) {
      setError('Staff full name must be at least 2 characters long');
      return;
    }

    if (!formData.email || !isValidEmail(formData.email)) {
      setError('A valid email address is required (used for staff login)');
      return;
    }

    if (!formData.employeeId || !formData.employeeId.trim()) {
      setError('Employee ID is required');
      return;
    }

    if (!formData.subject && (!formData.department || !formData.department.trim())) {
      setError('Please select a Subject for this staff member');
      return;
    }

    if (!isNonNegativeNumber(formData.salary)) {
      setError('Salary must be a non-negative number');
      return;
    }

    if (formData.experienceYears && !isNonNegativeNumber(formData.experienceYears)) {
      setError('Experience years must be a non-negative number');
      return;
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      setError('Please provide a valid phone number (7-15 digits)');
      return;
    }

    setLoading(true);
    
    const payload = { 
      ...formData,
      subject: formData.subject || undefined,
      department: formData.department?.trim() || 'General',
      salary: Number(formData.salary) || 0,
      experienceYears: Number(formData.experienceYears) || 0
    };
    
    if (mode === 'add') {
      Object.assign(payload, {
        username: formData.email.trim(),
        password: formData.employeeId.trim()
      });
    }

    try {
      if (mode === 'add') {
        await api.post('/api/staff', payload);
      } else if (mode === 'edit') {
        await api.put(`/api/staff/${initialData._id}`, payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${mode} staff`);
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="px-6 py-4 border-b flex justify-between bg-gray-50/50 shrink-0">
              <h3 className="text-xl font-bold">
                {mode === 'add' ? 'Add New Staff Member' : mode === 'edit' ? 'Edit Staff Details' : 'View Staff Details'}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {error && <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded-xl border border-red-100">{error}</div>}
              
              <form id="staff-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Basic Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Full Name" id="name" value={formData.name} onChange={handleChange} required disabled={isReadOnly} />
                    <Input label="Email ID (Used for Login)" id="email" type="email" value={formData.email} onChange={handleChange} required disabled={isReadOnly} />
                  </div>
                  {mode === 'add' && <p className="text-xs text-slate-500 mt-2 italic">Note: Login ID will be Email ID and Password will be Employee ID.</p>}
                </div>

                <hr className="border-slate-100" />

                <div>
                  <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Professional Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Employee ID" id="employeeId" value={formData.employeeId} onChange={handleChange} required disabled={isReadOnly} />
                    
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-1.5" htmlFor="subject">Subject (Required)</label>
                      <select 
                        id="subject" 
                        value={formData.subject} 
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const subObj = subjects.find(s => s._id === selectedId);
                          setFormData(prev => ({
                            ...prev,
                            subject: selectedId,
                            department: subObj ? subObj.name : ''
                          }));
                        }} 
                        className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white outline-none disabled:bg-slate-100"
                        required 
                        disabled={isReadOnly}
                      >
                        <option value="">-- Choose Subject --</option>
                        {subjects.map(s => (
                          <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                        ))}
                      </select>
                    </div>

                    <Input label="Designation" id="designation" value={formData.designation} onChange={handleChange} placeholder="e.g. Senior Teacher" required disabled={isReadOnly} />
                    <Input label="Joining Date" id="joiningDate" type="date" value={formData.joiningDate} onChange={handleChange} required disabled={isReadOnly} />
                    <Input label="Qualification" id="qualification" value={formData.qualification} onChange={handleChange} placeholder="e.g. M.Sc, B.Ed" disabled={isReadOnly} />
                    <Input label="Experience (Years)" id="experienceYears" type="number" value={formData.experienceYears} onChange={handleChange} disabled={isReadOnly} />
                    <Input label="Salary" id="salary" type="number" value={formData.salary} onChange={handleChange} required disabled={isReadOnly} />
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Assigned Classes & Sections */}
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Assigned Classes & Sections</h4>
                      <p className="text-xs text-slate-500">Select class sections for this teacher ({formData.assignedClasses.length} of {classes.length} selected):</p>
                    </div>
                    {!isReadOnly && classes.length > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAllClasses}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          Check All ({classes.length})
                        </button>
                        <button
                          type="button"
                          onClick={handleClearAllClasses}
                          className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {classes.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No class sections available.</div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto pr-1">
                      {classes.map(c => {
                        const isChecked = formData.assignedClasses.includes(c._id);
                        return (
                          <label key={c._id} className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${isChecked ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleClassToggle(c._id)}
                              disabled={isReadOnly}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{c.name.toLowerCase().startsWith('class') ? c.name : `Class ${c.name}`} - Sec {c.section}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <hr className="border-slate-100" />

                <div>
                  <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Contact Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Phone Number" id="phone" value={formData.phone} onChange={handleChange} disabled={isReadOnly} />
                  </div>
                  <div className="mt-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1.5" htmlFor="address">Address</label>
                    <textarea id="address" rows={2} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none disabled:bg-gray-100" value={formData.address} onChange={handleChange} disabled={isReadOnly}></textarea>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50/50 shrink-0 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>{isReadOnly ? 'Close' : 'Cancel'}</Button>
              {!isReadOnly && (
                <Button form="staff-form" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Add Staff Member'}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
