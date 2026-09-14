"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Bell, Calendar, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { NoticeModal } from '@/components/organisms/NoticeModal';
import { Button } from '@/components/atoms/Button';

export default function TeacherCommunicationPage() {
  const { user } = useAuthStore();
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchNotices = async () => {
    try {
      const res = await api.get('/api/notices');
      // Filter notices meant for All, Teachers, or posted by this teacher
      const relevant = res.data.filter((n: any) => 
        n.targetAudience === 'All' || n.targetAudience === 'Teachers' || 
        n.targetAudience === 'ALL' || n.targetAudience === 'TEACHER' ||
        n.postedBy === user?.id || n.postedBy?._id === user?.id
      );
      setNotices(relevant);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [user]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Staff Notice Board</h1>
          <p className="text-slate-500 mt-1">Read important announcements and internal communications.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Post Notice
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p>No new notices at this time.</p>
          </div>
        ) : (
          notices.map((notice, i) => (
            <motion.div key={notice._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Bell className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{notice.title}</h3>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase tracking-wider">
                    {notice.targetAudience === 'SpecificClass' && notice.targetClass ? 
                       `Class ${notice.targetClass.name}-${notice.targetClass.section}` : 
                       notice.targetAudience}
                  </span>
                </div>
                <p className="text-slate-600 whitespace-pre-wrap mb-4">{notice.content}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Calendar className="w-4 h-4" />
                  {new Date(notice.createdAt || notice.date).toLocaleDateString()} by {notice.postedBy?.name || 'Administration'}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      
      <NoticeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchNotices} />
    </div>
  );
}
