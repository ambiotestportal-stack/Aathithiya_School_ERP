"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Calendar, BookOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentExamsPage() {
  const { user } = useAuthStore();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/api/exams');
        setExams(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchExams();
  }, [user]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Exam Timetable</h1>
        <p className="text-slate-500 mt-1">View your examination schedule and subject dates.</p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading exams...</div>
        ) : exams.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p>No upcoming exams scheduled.</p>
          </div>
        ) : (
          exams.map((exam, i) => (
            <motion.div key={exam._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{exam.name}</h3>
                  {exam.description && <p className="text-sm text-slate-500 mt-0.5">{exam.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    exam.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                    exam.status === 'Ongoing' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {exam.status}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" /> Subject Timetable
                </h4>

                {!exam.schedule || exam.schedule.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No subject timetable specified yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {exam.schedule.map((item: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-bold text-slate-800 text-sm truncate">{item.subject?.name || 'Subject'}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-200/60 pt-2 mt-1">
                          <span>Date:</span>
                          <span className="font-bold text-indigo-600 font-mono">{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
