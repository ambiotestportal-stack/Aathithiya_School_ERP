"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/atoms/Button';
import { FeeNoticeModal } from '@/components/organisms/FeeNoticeModal';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';
import { 
  Plus, Search, Calendar, Bell, BookOpen, 
  Trash2, Users, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function FeeNoticePage() {
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; ids: string[] }>({ open: false, ids: [] });
  
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/finance/fees');
      setFees(res.data);
    } catch (error) {
      console.error('Failed to fetch fee notices', error);
      toast.error('Failed to fetch fee notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleDeleteNotices = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => api.delete(`/api/finance/fees/${id}`)));
      toast.success('Fee notice deleted successfully');
      fetchFees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete fee notice');
    } finally {
      setDeleteConfirm({ open: false, ids: [] });
    }
  };

  // Group fees by class + feeName + dueDate + amount to show clean Class Fee Notices
  const groupedNotices = useMemo(() => {
    const groups: { [key: string]: any } = {};

    fees.forEach(fee => {
      const className = fee.student?.enrolledClass?.name || 'Unassigned';
      const feeName = fee.feeName || fee.remarks || 'Tuition Fee';
      const dueDate = fee.dueDate ? new Date(fee.dueDate).toISOString().split('T')[0] : '';
      const amount = Number(fee.amount) || 0;
      const key = `${className}__${feeName}__${dueDate}__${amount}`;

      if (!groups[key]) {
        groups[key] = {
          id: fee._id,
          allIds: [fee._id],
          className,
          feeName,
          amount,
          dueDate: fee.dueDate,
          remarks: fee.remarks,
          studentCount: 1
        };
      } else {
        groups[key].allIds.push(fee._id);
        groups[key].studentCount += 1;
      }
    });

    return Object.values(groups);
  }, [fees]);

  // Unique classes for filter dropdown
  const uniqueClasses = Array.from(
    new Set(groupedNotices.map(n => n.className).filter(Boolean))
  );

  const filteredNotices = groupedNotices.filter(notice => {
    const feeName = notice.feeName || '';
    const className = notice.className || '';

    const matchesSearch = feeName.toLowerCase().includes(search.toLowerCase()) ||
      className.toLowerCase().includes(search.toLowerCase());

    const matchesClass = !filterClass || className.toLowerCase() === filterClass.toLowerCase();

    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bell className="w-8 h-8 text-blue-600" /> Fee Notice
          </h1>
          <p className="text-slate-500 mt-1">Class-wide scheduled fee announcements, notices, and payment deadlines.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Publish Fee Notice
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex-1 w-full relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by fee name or class..." 
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-blue-500 text-sm font-medium text-slate-800 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {uniqueClasses.length > 0 && (
          <div className="w-full sm:w-60">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white text-sm font-medium text-slate-700"
            >
              <option value="">All Classes</option>
              {uniqueClasses.map(c => (
                <option key={c} value={c}>
                  {c.toLowerCase().startsWith('class') ? c : `Class ${c}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Fee Notice Table without Student Details */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/70">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Target Class</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Fee Name & Description</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Assigned Audience</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Fee Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    Loading fee notices...
                  </td>
                </tr>
              ) : filteredNotices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-6 h-6" />
                    </div>
                    <p className="text-slate-600 font-bold text-base">No fee notices found</p>
                    <p className="text-slate-400 text-xs mt-1">Click "Publish Fee Notice" to announce a new class fee schedule.</p>
                  </td>
                </tr>
              ) : (
                filteredNotices.map((notice, index) => {
                  const displayClassName = notice.className.toLowerCase().startsWith('class') 
                    ? notice.className 
                    : `Class ${notice.className}`;

                  return (
                    <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                      {/* Target Class Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shadow-sm">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm capitalize">
                              {displayClassName}
                            </div>
                            <div className="text-xs text-slate-500 font-medium">
                              All Sections Enrolled
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Fee Name / Info */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                          {notice.feeName}
                        </div>
                        {notice.remarks && notice.remarks !== notice.feeName && (
                          <div className="text-xs text-slate-500 mt-0.5 ml-4 italic">{notice.remarks}</div>
                        )}
                      </td>

                      {/* Assigned Audience */}
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <span>{notice.studentCount} {notice.studentCount === 1 ? 'Student' : 'Students'}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <div className="font-black text-slate-900 text-base font-mono">
                          ${Number(notice.amount).toLocaleString()}
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60 text-xs font-bold">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          Due: {new Date(notice.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>

                      {/* Actions: Delete Notice */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => setDeleteConfirm({ open: true, ids: notice.allIds })}
                            title="Delete Fee Notice"
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Fee Notice Modal */}
      <FeeNoticeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchFees} 
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        title="Delete Fee Notice"
        message="Are you sure you want to delete this class fee notice? This will remove the scheduled fee for all students in this class."
        variant="danger"
        confirmLabel="Delete Notice"
        onConfirm={() => deleteConfirm.ids.length > 0 && handleDeleteNotices(deleteConfirm.ids)}
        onCancel={() => setDeleteConfirm({ open: false, ids: [] })}
      />
    </div>
  );
}
