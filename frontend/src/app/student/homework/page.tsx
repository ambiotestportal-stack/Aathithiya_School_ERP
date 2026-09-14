"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, Clock, FileText, CheckCircle2, Eye, X, User, Calendar } from 'lucide-react';
import { Button } from '@/components/atoms/Button';

const HomeworkDetailsModal = ({ isOpen, onClose, hw }: { isOpen: boolean; onClose: () => void; hw: any }) => {
  if (!isOpen || !hw) return null;

  const isOverdue = new Date(hw.dueDate) < new Date() && new Date(hw.dueDate).toDateString() !== new Date().toDateString();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative z-10 overflow-hidden flex flex-col">
          
          <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50/80">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                {hw.subject?.name || 'Subject'}
              </span>
              <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold">
                Class {hw.enrolledClass?.name} - {hw.enrolledClass?.section}
              </span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">{hw.title}</h2>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-indigo-500" /> Assigned by: <strong className="text-slate-700">{hw.assignedBy?.name || 'Teacher'}</strong></span>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Instructions & Details</h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {hw.description}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Assigned Date</div>
                  <div className="text-xs font-bold text-slate-800">{new Date(hw.createdAt || Date.now()).toLocaleDateString()}</div>
                </div>
              </div>

              <div className={`p-3 rounded-xl border flex items-center gap-3 ${isOverdue ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                <Clock className={`w-5 h-5 shrink-0 ${isOverdue ? 'text-red-500' : 'text-amber-500'}`} />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Submission Due</div>
                  <div className={`text-xs font-bold ${isOverdue ? 'text-red-600' : 'text-amber-700'}`}>
                    {new Date(hw.dueDate).toLocaleDateString()} {isOverdue && '(Overdue)'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t bg-slate-50/50 flex justify-end">
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default function StudentHomeworkPage() {
  const { user } = useAuthStore();
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHw, setSelectedHw] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchHomeworks = async () => {
      setLoading(true);
      try {
        let classId = null;
        try {
          const profileRes = await api.get(`/api/students/me?userId=${user?.id}`);
          classId = profileRes.data?.enrolledClass?._id || profileRes.data?.enrolledClass;
        } catch (e) {
          // Fallback if not a student profile
        }
        
        if (classId) {
          const hwRes = await api.get(`/api/homework?classId=${classId}`);
          setHomeworks(hwRes.data);
        } else {
          // Fallback: fetch all homework if logged in as admin/teacher/testing
          const hwRes = await api.get('/api/homework');
          setHomeworks(hwRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchHomeworks();
  }, [user]);

  const handleOpenDetails = (hw: any) => {
    setSelectedHw(hw);
    setIsModalOpen(true);
  };

  const sortedHw = [...homeworks].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Homework</h1>
        <p className="text-slate-500 mt-1">Track your daily assignments and upcoming due dates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading your tasks...</div>
        ) : sortedHw.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-lg font-bold text-slate-700">All caught up!</p>
            <p>No homework assignments right now.</p>
          </div>
        ) : (
          sortedHw.map((hw, i) => {
            const isOverdue = new Date(hw.dueDate) < new Date() && new Date(hw.dueDate).toDateString() !== new Date().toDateString();
            
            return (
              <motion.div key={hw._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden flex flex-col relative group">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${isOverdue ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
                <div className="p-5 flex-1 cursor-pointer" onClick={() => handleOpenDetails(hw)}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                      {hw.subject?.name || 'Subject'}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Class {hw.enrolledClass?.name} - {hw.enrolledClass?.section}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{hw.title}</h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{hw.description}</p>
                  
                  <div className={`flex items-center gap-2 text-sm mt-auto pt-4 border-t border-slate-100 ${isOverdue ? 'text-red-500 font-bold' : 'text-slate-500 font-medium'}`}>
                    <Clock className="w-4 h-4" />
                    <span>Due: {new Date(hw.dueDate).toLocaleDateString()} {isOverdue && '(Overdue)'}</span>
                  </div>
                </div>

                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">By: {hw.assignedBy?.name || 'Teacher'}</span>
                  </div>
                  
                  <button 
                    onClick={() => handleOpenDetails(hw)}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <HomeworkDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        hw={selectedHw} 
      />
    </div>
  );
}
