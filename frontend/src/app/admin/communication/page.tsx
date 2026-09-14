"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { NoticeModal } from '@/components/organisms/NoticeModal';
import { Plus, Trash2, Megaphone, Bell, CalendarClock } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

export default function CommunicationPage() {
  const { user } = useAuthStore();
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('All');

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/notices');
      setNotices(res.data);
    } catch (error) {
      console.error('Failed to fetch notices', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this notice?')) {
      try {
        await api.delete(`/api/notices/${id}`);
        fetchNotices();
      } catch (error) {
        alert('Failed to delete notice');
      }
    }
  };

  const filteredNotices = filter === 'All' ? notices : notices.filter(n => n.targetAudience === filter);

  const formatAudience = (audience: string) => {
    if (audience === 'All') return { label: 'Public Broadcast', color: 'bg-purple-100 text-purple-700' };
    if (audience === 'Teachers') return { label: 'Staff Only', color: 'bg-blue-100 text-blue-700' };
    if (audience === 'Students') return { label: 'Students Only', color: 'bg-emerald-100 text-emerald-700' };
    if (audience === 'Parents') return { label: 'Parents Only', color: 'bg-amber-100 text-amber-700' };
    return { label: audience, color: 'bg-slate-100 text-slate-700' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Notice Board</h1>
          <p className="text-slate-500 mt-1">Broadcast announcements to staff, students, and parents.</p>
        </div>
        {user?.role === 'SUPER_ADMIN' && (
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-5 h-5" /> Post Notice
          </Button>
        )}
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['All', 'Teachers', 'Students', 'Parents'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
              filter === f ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === 'All' ? 'All Notices' : f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading notices...</div>
        ) : filteredNotices.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 flex flex-col items-center">
            <Bell className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-800">No notices found</p>
            <p className="text-sm">There are currently no announcements for this category.</p>
          </div>
        ) : (
          filteredNotices.map((notice, i) => (
            <motion.div 
              key={notice._id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${formatAudience(notice.targetAudience).color}`}>
                    {formatAudience(notice.targetAudience).label}
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5" /> 
                    {new Date(notice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3">{notice.title}</h3>
                <p className="text-slate-600 whitespace-pre-wrap">{notice.content}</p>
                
                <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-slate-400" />
                  Posted by <span className="font-bold text-slate-700">{notice.postedBy?.name}</span>
                </div>
              </div>

              {user?.role === 'SUPER_ADMIN' && (
                <div className="flex-shrink-0 flex items-start justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDelete(notice._id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      <NoticeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchNotices} />
    </div>
  );
}
