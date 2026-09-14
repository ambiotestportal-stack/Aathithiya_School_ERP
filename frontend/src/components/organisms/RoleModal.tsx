import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import api from '@/lib/axios';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'add' | 'edit';
  initialData?: any;
}

export const SECTIONS = [
  { id: '/admin/dashboard', label: 'Dashboard' },
  { id: '/admin/school', label: 'School Management' },
  { id: '/admin/users', label: 'User Management' },
  { id: '/admin/academic', label: 'Academic' },
  { id: '/admin/academic/calendar', label: 'Academic Calendar' },
  { id: '/admin/academic/timetable', label: 'Timetable Hub' },
  { id: '/admin/students', label: 'Student' },
  { id: '/admin/parents', label: 'Parent Management' },
  { id: '/admin/staff', label: 'Staff' },
  { id: '/admin/finance', label: 'Finance' },
  { id: '/admin/exam', label: 'Examination' },
  { id: '/admin/attendance', label: 'Attendance' },
  { id: '/admin/communication', label: 'Announcements' },
  { id: '/admin/transport', label: 'Transport' },
  { id: '/admin/hostel', label: 'Hostel' },
  { id: '/admin/reports', label: 'Reports' },
  { id: '/admin/recovery', label: 'Recovery / Trash' },
  { id: '/admin/settings', label: 'Settings' }
];

export const RoleModal = ({ isOpen, onClose, onSuccess, mode, initialData }: RoleModalProps) => {
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setName(initialData.name || '');
        setPermissions(initialData.permissions || []);
      } else {
        setName('');
        setPermissions([]);
      }
    }
  }, [isOpen, mode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name, permissions };
      if (mode === 'add') {
        await api.post('/api/roles', payload);
      } else {
        await api.put(`/api/roles/${initialData._id}`, payload);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckbox = (id: string) => {
    if (permissions.includes(id)) {
      setPermissions(permissions.filter(p => p !== id));
    } else {
      setPermissions([...permissions, id]);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800">{mode === 'add' ? 'Create New Role' : 'Edit Role'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Role Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g., Librarian" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Select Accessible Sections</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1">
                {SECTIONS.map(section => (
                  <label key={section.id} className="flex items-center p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input type="checkbox" checked={permissions.includes(section.id)} onChange={() => handleCheckbox(section.id)} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                    <span className="ml-3 text-sm font-medium text-slate-700">{section.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Role'}</Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
