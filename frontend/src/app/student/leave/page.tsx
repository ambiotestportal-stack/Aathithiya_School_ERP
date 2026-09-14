"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Plus, Clock, CheckCircle, XCircle, Calendar, X } from 'lucide-react';

import { isDateRangeValid } from '@/lib/validation';

const LeaveModal = ({ isOpen, onClose, onSuccess, studentId }: any) => {
  const [formData, setFormData] = useState({ reason: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.startDate || !formData.endDate || !isDateRangeValid(formData.startDate, formData.endDate)) {
      setError('Leave start date must be before or equal to end date');
      return;
    }

    if (!formData.reason || !formData.reason.trim()) {
      setError('Please provide a reason for leave');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/leave', { 
        ...formData, 
        reason: formData.reason.trim(),
        student: studentId 
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
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
              <h3 className="text-xl font-bold">Apply for Leave</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-200">
                  {error}
                </div>
              )}
              <form id="leave-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Start Date" id="startDate" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
                  <Input label="End Date" id="endDate" type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">Reason</label>
                  <textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} required className="w-full px-4 py-3 rounded-xl border bg-gray-50 outline-none" rows={4} placeholder="e.g. Medical appointment, Family event..."></textarea>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50/50 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button form="leave-form" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function StudentLeavePage() {
  const { user } = useAuthStore();
  const [profileId, setProfileId] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const profileRes = await api.get(`/api/students/me?userId=${user?.id}`);
      setProfileId(profileRes.data._id);
      
      const leaveRes = await api.get(`/api/leave?studentId=${profileRes.data._id}`);
      setRequests(leaveRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchRequests();
  }, [user]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leave Requests</h1>
          <p className="text-slate-500 mt-1">Apply for and track your leave applications.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-5 h-5" /> Apply for Leave
        </Button>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Leave Period</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Reason</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Reviewed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Loading requests...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-500">No leave requests found.</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-800 font-medium">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 pl-6">
                        Applied on {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700 line-clamp-2 max-w-md">{req.reason}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex w-fit items-center gap-1.5 ${
                        req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                        req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {req.status === 'Approved' ? <CheckCircle className="w-3.5 h-3.5" /> : 
                         req.status === 'Rejected' ? <XCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {req.reviewedBy ? (
                        <span className="text-sm font-medium text-slate-800">{req.reviewedBy.name}</span>
                      ) : (
                        <span className="text-sm italic text-slate-400">Pending Review</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LeaveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchRequests} studentId={profileId} />
    </div>
  );
}
