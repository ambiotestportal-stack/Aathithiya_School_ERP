"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/atoms/Button';
import { CheckCircle, XCircle, Clock, Calendar, Check, X } from 'lucide-react';

export default function TeacherLeavePage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const classRes = await api.get('/api/academic/classes');
      const myClasses = classRes.data.filter((c: any) => c.classTeacher?._id === user?.id || c.classTeacher === user?.id);
      
      const classIds = myClasses.map((c: any) => c._id).join(',');
      
      if (classIds) {
        const leaveRes = await api.get(`/api/leave?classIds=${classIds}`);
        setRequests(leaveRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchRequests();
  }, [user]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/api/leave/${id}/status`, { status, reviewedBy: user?.id });
      fetchRequests();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leave Approvals</h1>
        <p className="text-slate-500 mt-1">Review and approve leave applications from students in your assigned classes.</p>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Student</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Leave Period</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Reason</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Loading requests...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-500">No leave requests pending for your classes.</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{req.student?.user?.name}</div>
                      <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded w-fit mt-1">
                        Class {req.student?.enrolledClass?.name} - {req.student?.enrolledClass?.section}
                      </div>
                    </td>
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
                      <p className="text-sm text-slate-700 line-clamp-2 max-w-sm">{req.reason}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {req.status === 'Pending' ? (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleUpdateStatus(req._id, 'Approved')} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors" title="Approve">
                            <Check className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleUpdateStatus(req._id, 'Rejected')} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors" title="Reject">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                          req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {req.status === 'Approved' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {req.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
