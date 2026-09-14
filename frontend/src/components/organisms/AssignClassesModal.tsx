"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../atoms/Button';
import { X, Check } from 'lucide-react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';

interface AssignClassesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  staffMember: any;
}

export const AssignClassesModal = ({ isOpen, onClose, onSuccess, staffMember }: AssignClassesModalProps) => {
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && staffMember) {
      const currentAssigned = (staffMember.assignedClasses || []).map((c: any) => c._id || c);
      setAssignedClasses(currentAssigned);
      setSelectedSubject(staffMember.subject?._id || staffMember.subject || '');

      Promise.all([
        api.get('/api/academic/classes'),
        api.get('/api/academic/subjects')
      ]).then(([classRes, subRes]) => {
        setClasses(classRes.data);
        setSubjects(subRes.data);
        if (!staffMember.subject && staffMember.department) {
          const found = subRes.data.find((s: any) => s.name === staffMember.department);
          if (found) setSelectedSubject(found._id);
        }
      }).catch(console.error);
    }
  }, [isOpen, staffMember]);

  const handleToggle = (classId: string) => {
    setAssignedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSelectAll = () => {
    const allIds = classes.map(c => c._id);
    setAssignedClasses(allIds);
  };

  const handleClearAll = () => {
    setAssignedClasses([]);
  };

  const handleSave = async () => {
    if (!staffMember) return;
    setLoading(true);
    setError('');

    const subObj = subjects.find(s => s._id === selectedSubject);

    try {
      await api.put(`/api/staff/${staffMember._id}`, {
        name: staffMember.user?.name,
        email: staffMember.user?.email,
        employeeId: staffMember.employeeId,
        subject: selectedSubject || undefined,
        department: subObj ? subObj.name : staffMember.department,
        designation: staffMember.designation,
        joiningDate: staffMember.joiningDate,
        qualification: staffMember.qualification,
        experienceYears: staffMember.experienceYears,
        salary: staffMember.salary,
        phone: staffMember.phone,
        address: staffMember.address,
        assignedClasses: assignedClasses
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update class assignments');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !staffMember) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative z-10 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Assign Subject & Classes</h3>
              <p className="text-xs text-indigo-600 font-semibold mt-0.5">{staffMember.user?.name} ({staffMember.employeeId})</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
          
          <div className="p-6 space-y-4">
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">{error}</div>}
            
            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Assigned Subject (Matched by ID):</label>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white outline-none text-sm font-medium"
              >
                <option value="">-- Choose Subject --</option>
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <hr className="border-slate-100" />

            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Classes Taught ({assignedClasses.length} of {classes.length}):
              </p>
              {classes.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    Check All ({classes.length})
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
            
            {classes.length === 0 ? (
              <div className="text-sm text-slate-400 italic py-6 text-center">No class sections created yet.</div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 max-h-[250px] overflow-y-auto pr-1">
                {classes.map(c => {
                  const isChecked = assignedClasses.includes(c._id);
                  return (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => handleToggle(c._id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        isChecked 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs ring-1 ring-indigo-200' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{c.name.toLowerCase().startsWith('class') ? c.name : `Class ${c.name}`} - Sec {c.section}</span>
                      {isChecked && <div className="w-4 h-4 bg-indigo-600 text-white rounded-full flex items-center justify-center shrink-0"><Check className="w-3 h-3" /></div>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 border-t bg-gray-50/50 flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Assignments'}</Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
