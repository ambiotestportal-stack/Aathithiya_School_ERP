"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArchiveRestore, Trash2, ShieldAlert, History, RotateCcw } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';

interface DeletedRecord {
  id: string;
  userId: string;
  name: string;
  username: string;
  role: string;
  deletedAt: string;
  identifier: string;
}

export default function RecoveryPage() {
  const [records, setRecords] = useState<DeletedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionRecord, setActionRecord] = useState<DeletedRecord | null>(null);
  const [actionType, setActionType] = useState<'restore' | 'delete' | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/recovery');
      setRecords(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch deleted records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleAction = async () => {
    if (!actionRecord || !actionType) return;
    
    try {
      if (actionType === 'restore') {
        await api.put(`/api/recovery/${actionRecord.id}/restore`, {
          type: actionRecord.role,
          userId: actionRecord.userId
        });
        toast.success(`Restored ${actionRecord.name} successfully`);
      } else {
        await api.delete(`/api/recovery/${actionRecord.id}?type=${actionRecord.role}&userId=${actionRecord.userId}`);
        toast.success(`Permanently deleted ${actionRecord.name}`);
      }
      
      setRecords(records.filter(r => r.id !== actionRecord.id));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setActionRecord(null);
      setActionType(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-blue-600" />
            Data Recovery
          </h1>
          <p className="text-slate-500 mt-1">Manage, restore, or permanently delete soft-deleted records.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID / Roll No</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Deleted At</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading deleted records...</td></tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                    <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-lg font-medium text-slate-700">Trash is empty</p>
                    <p className="text-sm">No soft-deleted records found.</p>
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold mr-3 border border-slate-200">
                          {record.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{record.name}</div>
                          <div className="text-xs text-slate-500">{record.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        record.role === 'STUDENT' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {record.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                      {record.identifier || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(record.deletedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setActionRecord(record); setActionType('restore'); }}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Restore Record"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => { setActionRecord(record); setActionType('delete'); }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Permanently Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!actionRecord}
        onCancel={() => { setActionRecord(null); setActionType(null); }}
        onConfirm={handleAction}
        title={actionType === 'restore' ? 'Restore Record' : 'Permanently Delete'}
        message={actionType === 'restore' 
          ? `Are you sure you want to restore ${actionRecord?.name}? They will regain access to their account and appear in normal lists.`
          : `Are you sure you want to permanently delete ${actionRecord?.name}? This action CANNOT be undone and all their data will be erased.`}
        confirmLabel={actionType === 'restore' ? 'Restore' : 'Delete Permanently'}
        variant={actionType === 'restore' ? 'warning' : 'danger'}
      />
    </div>
  );
}
