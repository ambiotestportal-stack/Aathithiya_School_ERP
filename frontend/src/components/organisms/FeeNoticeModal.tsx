"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { X, BellRing, Sparkles, Edit3 } from 'lucide-react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { isPositiveNumber, isValidDate } from '@/lib/validation';
import { toast } from 'sonner';

interface FeeNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const PREDEFINED_FEE_NAMES = [
  'Term Fees 1',
  'Term Fees 2',
  'Term Fees 3',
  'Annual Tuition Fee',
  'Admission Fee',
  'Examination Fee',
  'Transport / Bus Fee',
  'Lab & Library Fee',
  'Sports & Activities Fee',
  'Custom'
];

export const FeeNoticeModal = ({ isOpen, onClose, onSuccess, initialData }: FeeNoticeModalProps) => {
  const isEdit = !!initialData;
  const [selectedFeeType, setSelectedFeeType] = useState('Term Fees 1');
  const [customFeeName, setCustomFeeName] = useState('');
  const [selectedClassName, setSelectedClassName] = useState('');

  const [formData, setFormData] = useState({
    amount: '',
    dueDate: '',
    remarks: ''
  });

  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      api.get('/api/academic/classes')
        .then(res => setClasses(res.data))
        .catch(console.error);

      if (initialData) {
        const feeName = initialData.feeName || initialData.remarks || 'Term Fees 1';
        if (PREDEFINED_FEE_NAMES.includes(feeName)) {
          setSelectedFeeType(feeName);
          setCustomFeeName('');
        } else {
          setSelectedFeeType('Custom');
          setCustomFeeName(feeName);
        }

        const dateStr = initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '';
        setFormData({
          amount: String(initialData.amount || ''),
          dueDate: dateStr,
          remarks: initialData.remarks || ''
        });
        setSelectedClassName(initialData.student?.enrolledClass?.name || '');
      } else {
        setSelectedFeeType('Term Fees 1');
        setCustomFeeName('');
        setSelectedClassName('');
        setFormData({ amount: '', dueDate: '', remarks: '' });
      }
    }
  }, [isOpen, initialData]);

  // Unique class names across all sections
  const uniqueClassNames = Array.from(new Set(classes.map(c => c.name)));

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

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

    if (!isEdit && !selectedClassName) {
      setError('Please select a target class');
      return;
    }

    const resolvedFeeName = selectedFeeType === 'Custom' 
      ? (customFeeName.trim() || 'Custom Fee')
      : selectedFeeType;

    setLoading(true);

    try {
      if (isEdit) {
        const payload = {
          feeName: resolvedFeeName,
          amount: numAmount,
          dueDate: formData.dueDate,
          remarks: formData.remarks?.trim() || resolvedFeeName
        };
        await api.put(`/api/finance/fees/${initialData._id}`, payload);
        toast.success('Fee notice updated successfully');
      } else {
        const payload = {
          className: selectedClassName,
          feeName: resolvedFeeName,
          amount: numAmount,
          dueDate: formData.dueDate,
          remarks: formData.remarks?.trim() || resolvedFeeName
        };
        await api.post('/api/finance/fees', payload);
        toast.success('Fee notice published successfully');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'publish'} fee notice`);
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
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${isEdit ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-600'}`}>
                  {isEdit ? <Edit3 className="w-5 h-5" /> : <BellRing className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Fee Notice' : 'Publish Fee Notice'}</h3>
                  <p className="text-xs text-slate-500">{isEdit ? 'Update fee amount, due date or fee name' : 'Announce class-wide fee requirements and due dates'}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-200">
                  {error}
                </div>
              )}
              <form id="fee-notice-form" onSubmit={handleSubmit} className="space-y-4">
                
                {/* Fee Name Selection */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Fee Category / Name
                  </label>
                  <select 
                    value={selectedFeeType} 
                    onChange={(e) => setSelectedFeeType(e.target.value)} 
                    className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none font-medium text-slate-800"
                    required
                  >
                    {PREDEFINED_FEE_NAMES.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>

                {selectedFeeType === 'Custom' && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                    <Input 
                      label="Custom Fee Name" 
                      id="customFeeName" 
                      placeholder="e.g. Annual Picnic & Kit Fee" 
                      value={customFeeName} 
                      onChange={(e) => setCustomFeeName(e.target.value)} 
                      required 
                    />
                  </motion.div>
                )}

                {/* Target Class */}
                {isEdit ? (
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-1.5">Assigned Student / Class</label>
                    <div className="p-3 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700">
                      {initialData.student?.user?.name} (Class {initialData.student?.enrolledClass?.name || 'N/A'} - {initialData.student?.enrolledClass?.section || 'A'}, Roll: {initialData.student?.rollNumber})
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-1.5">Target Class</label>
                    <select 
                      value={selectedClassName} 
                      onChange={(e) => setSelectedClassName(e.target.value)} 
                      className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none font-medium text-slate-800"
                      required
                    >
                      <option value="">-- Select Target Class --</option>
                      {uniqueClassNames.map(name => (
                        <option key={name} value={name}>
                          {name.toLowerCase().startsWith('class') ? name : `Class ${name}`} (All Sections)
                        </option>
                      ))}
                    </select>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      This notice will be published to all enrolled students in the selected class.
                    </span>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Amount ($)" 
                    id="amount" 
                    type="number" 
                    placeholder="e.g. 10000"
                    value={formData.amount} 
                    onChange={handleChange} 
                    required 
                  />
                  <Input 
                    label="Due Date" 
                    id="dueDate" 
                    type="date" 
                    value={formData.dueDate} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-1.5">Remarks / Instructions (Optional)</label>
                  <textarea 
                    id="remarks" 
                    value={formData.remarks} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none text-sm text-slate-800" 
                    rows={2} 
                    placeholder="e.g. Please complete payment before term exam commences"
                  />
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50/50 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button form="fee-notice-form" type="submit" disabled={loading}>
                {loading ? 'Saving...' : (isEdit ? 'Update Fee Notice' : 'Publish Fee Notice')}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
