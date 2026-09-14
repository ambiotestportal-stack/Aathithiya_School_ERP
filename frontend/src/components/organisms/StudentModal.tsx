"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { X, Bus } from 'lucide-react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { isValidEmail, isValidPhone, isNonNegativeNumber } from '@/lib/validation';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'add' | 'edit' | 'view';
  initialData?: any;
}

export const StudentModal = ({ isOpen, onClose, onSuccess, mode = 'add', initialData }: StudentModalProps) => {
  const [formData, setFormData] = useState({
    name: '', email: '',
    admissionNumber: '', rollNumber: '', enrolledClass: '',
    dob: '', gender: 'Male', bloodGroup: '', 
    fatherName: '', motherName: '', fatherOccupation: '', motherOccupation: '', contactNumber: '', annualIncome: '', address: '',
    transportMode: 'Walk', busNumber: ''
  });

  const [classes, setClasses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [transportVehicles, setTransportVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedClassName, setSelectedClassName] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/api/batches').then(res => setBatches(res.data)).catch(console.error);
      api.get('/api/academic/classes').then(res => setClasses(res.data)).catch(console.error);
      api.get('/api/transport').then(res => setTransportVehicles(res.data)).catch(console.error);

      if (initialData && (mode === 'edit' || mode === 'view')) {
        setFormData({
          name: initialData.user?.name || '',
          email: initialData.user?.email || '',
          admissionNumber: initialData.admissionNumber || '',
          rollNumber: initialData.rollNumber || '',
          enrolledClass: initialData.enrolledClass?._id || '',
          dob: initialData.dob ? new Date(initialData.dob).toISOString().split('T')[0] : '',
          gender: initialData.gender || 'Male',
          bloodGroup: initialData.bloodGroup || '',
          fatherName: initialData.fatherName || '',
          motherName: initialData.motherName || '',
          fatherOccupation: initialData.fatherOccupation || '',
          motherOccupation: initialData.motherOccupation || '',
          contactNumber: initialData.contactNumber || '',
          annualIncome: initialData.annualIncome || '',
          address: initialData.address || '',
          transportMode: initialData.transportMode || 'Walk',
          busNumber: initialData.busNumber || ''
        });

        if (initialData.enrolledClass) {
          setSelectedBatch(initialData.enrolledClass.batch?._id || initialData.enrolledClass.batch || '');
          setSelectedClassName(initialData.enrolledClass.name || '');
        }
      } else {
        setFormData({
          name: '', email: '', admissionNumber: '', rollNumber: '', enrolledClass: '',
          dob: '', gender: 'Male', bloodGroup: '', fatherName: '', motherName: '', 
          fatherOccupation: '', motherOccupation: '', contactNumber: '', annualIncome: '', address: '',
          transportMode: 'Walk', busNumber: ''
        });
        setSelectedBatch('');
        setSelectedClassName('');
      }
    }
  }, [isOpen, initialData, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const availableClasses = classes.filter((c: any) => (c.batch?._id || c.batch) === selectedBatch);
  const uniqueClassNames = Array.from(new Set(availableClasses.map(c => c.name)));
  const availableSections = availableClasses.filter(c => c.name === selectedClassName);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;
    
    setError('');

    if (!formData.name || formData.name.trim().length < 2) {
      setError('Student full name must be at least 2 characters long');
      return;
    }

    if (!formData.admissionNumber || !formData.admissionNumber.trim()) {
      setError('Admission number is required');
      return;
    }

    if (!formData.rollNumber || !formData.rollNumber.trim()) {
      setError('Roll number is required');
      return;
    }

    if (!formData.enrolledClass) {
      setError('Please select a batch, class, and section for the student');
      return;
    }

    if (formData.dob) {
      const dobDate = new Date(formData.dob);
      if (isNaN(dobDate.getTime()) || dobDate >= new Date()) {
        setError('Date of birth must be a valid date in the past');
        return;
      }
    }

    if (formData.email && !isValidEmail(formData.email)) {
      setError('Please provide a valid email address');
      return;
    }

    if (formData.contactNumber && !isValidPhone(formData.contactNumber)) {
      setError('Please provide a valid contact phone number (7-15 digits)');
      return;
    }

    if (formData.annualIncome && !isNonNegativeNumber(formData.annualIncome)) {
      setError('Annual income must be a non-negative number');
      return;
    }

    if (formData.transportMode === 'School Bus' && !formData.busNumber) {
      setError('Please select or enter a bus number for School Bus transport mode');
      return;
    }

    setLoading(true);
    
    const payload = {
      ...formData,
      annualIncome: formData.annualIncome ? Number(formData.annualIncome) : 0
    };
    
    if (mode === 'add') {
      // Auto-generate username and password
      Object.assign(payload, {
        username: formData.rollNumber.trim(),
        password: formData.dob.split('-').reverse().join('') // e.g., 15082010 for 2010-08-15
      });
    }
    
    try {
      if (mode === 'add') {
        await api.post('/api/students', payload);
      } else if (mode === 'edit') {
        await api.put(`/api/students/${initialData._id}`, payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${mode} student`);
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
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="px-6 py-4 border-b flex justify-between bg-gray-50/50 shrink-0">
              <h3 className="text-xl font-bold">
                {mode === 'add' ? 'Enroll New Student' : mode === 'edit' ? 'Edit Student Details' : 'View Student Details'}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {error && <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded-xl border border-red-100">{error}</div>}
              
              <form id="student-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Student Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Full Name" id="name" value={formData.name} onChange={handleChange} required disabled={isReadOnly} />
                    <Input label="Email (Optional)" id="email" type="email" value={formData.email} onChange={handleChange} disabled={isReadOnly} />
                    <Input label="Date of Birth" id="dob" type="date" value={formData.dob} onChange={handleChange} required disabled={isReadOnly} />
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1.5" htmlFor="gender">Gender</label>
                      <select id="gender" className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none disabled:bg-gray-100" value={formData.gender} onChange={handleChange} disabled={isReadOnly}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  {mode === 'add' && <p className="text-xs text-slate-500 mt-2 italic">Note: Login ID will be the Roll Number and Password will be the Date of Birth (DDMMYYYY).</p>}
                </div>

                <hr className="border-slate-100" />

                <div>
                  <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Academic Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input label="Admission Number" id="admissionNumber" value={formData.admissionNumber} onChange={handleChange} required disabled={isReadOnly} />
                    <Input label="Roll Number" id="rollNumber" value={formData.rollNumber} onChange={handleChange} required disabled={isReadOnly} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1.5" htmlFor="batchId">Batch</label>
                      <select id="batchId" className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none disabled:bg-gray-100" value={selectedBatch} onChange={e => { setSelectedBatch(e.target.value); setSelectedClassName(''); setFormData({...formData, enrolledClass: ''}); }} required disabled={isReadOnly}>
                        <option value="">Select Batch</option>
                        {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1.5" htmlFor="className">Class</label>
                      <select id="className" className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none disabled:bg-gray-100" value={selectedClassName} onChange={e => { setSelectedClassName(e.target.value); setFormData({...formData, enrolledClass: ''}); }} required disabled={!selectedBatch || isReadOnly}>
                        <option value="">Select Class</option>
                        {uniqueClassNames.map(name => <option key={name as string} value={name as string}>{name as string}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1.5" htmlFor="enrolledClass">Section</label>
                      <select id="enrolledClass" className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none disabled:bg-gray-100" value={formData.enrolledClass} onChange={handleChange} required disabled={!selectedClassName || isReadOnly}>
                        <option value="">Select Section</option>
                        {availableSections.map(c => <option key={c._id} value={c._id}>{c.section}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Transport Details Section */}
                <div>
                  <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Bus className="w-4 h-4 text-blue-600" /> Transport Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1.5" htmlFor="transportMode">
                        Mode of Transport
                      </label>
                      <select 
                        id="transportMode" 
                        className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none disabled:bg-gray-100 text-sm"
                        value={formData.transportMode} 
                        onChange={handleChange}
                        disabled={isReadOnly}
                      >
                        <option value="Walk">Walk</option>
                        <option value="Cycle">Cycle</option>
                        <option value="Parent Drop/Pickup">Parent Drop/Pickup</option>
                        <option value="School Bus">School Bus</option>
                        <option value="Private Vehicle">Private Vehicle</option>
                      </select>
                    </div>

                    {formData.transportMode === 'School Bus' && (
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1.5" htmlFor="busNumber">
                          Bus Number
                        </label>
                        {transportVehicles.length > 0 ? (
                          <select 
                            id="busNumber" 
                            className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none disabled:bg-gray-100 text-sm"
                            value={formData.busNumber} 
                            onChange={handleChange}
                            required={formData.transportMode === 'School Bus'}
                            disabled={isReadOnly}
                          >
                            <option value="">-- Select School Bus --</option>
                            {transportVehicles.map(v => (
                              <option key={v._id} value={v.busNumber || v.vehicleNumber}>
                                {v.busNumber ? `Bus No: ${v.busNumber}` : 'Bus'} ({v.vehicleNumber} - {v.route})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input 
                            label="" 
                            id="busNumber" 
                            placeholder="e.g. Bus 33" 
                            value={formData.busNumber} 
                            onChange={handleChange} 
                            required={formData.transportMode === 'School Bus'}
                            disabled={isReadOnly}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div>
                  <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Parent / Guardian Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Father's Name" id="fatherName" value={formData.fatherName} onChange={handleChange} required disabled={isReadOnly} />
                    <Input label="Father's Occupation" id="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} disabled={isReadOnly} />
                    <Input label="Mother's Name" id="motherName" value={formData.motherName} onChange={handleChange} required disabled={isReadOnly} />
                    <Input label="Mother's Occupation" id="motherOccupation" value={formData.motherOccupation} onChange={handleChange} disabled={isReadOnly} />
                    <Input label="Contact Number" id="contactNumber" value={formData.contactNumber} onChange={handleChange} required disabled={isReadOnly} />
                    <Input label="Annual Income (in ₹)" id="annualIncome" type="number" value={formData.annualIncome} onChange={handleChange} disabled={isReadOnly} />
                    <Input label="Blood Group (Student)" id="bloodGroup" value={formData.bloodGroup} onChange={handleChange} disabled={isReadOnly} />
                  </div>
                  <div className="mt-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1.5" htmlFor="address">Residential Address</label>
                    <textarea id="address" rows={2} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white outline-none disabled:bg-gray-100" value={formData.address} onChange={handleChange} required disabled={isReadOnly}></textarea>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50/50 shrink-0 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>{isReadOnly ? 'Close' : 'Cancel'}</Button>
              {!isReadOnly && (
                <Button form="student-form" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Enroll Student'}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
