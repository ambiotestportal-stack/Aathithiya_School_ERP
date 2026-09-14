"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { CheckCircle2, XCircle, Clock, Users } from 'lucide-react';

export default function ParentAttendancePage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const childrenRes = await api.get(`/api/students/children?parentId=${user?.id}`);
        const myChildren = childrenRes.data;
        setChildren(myChildren);
        
        const attData: Record<string, any[]> = {};
        for (const child of myChildren) {
          const res = await api.get(`/api/attendance/student/${child._id}`);
          attData[child._id] = res.data;
        }
        setAttendanceData(attData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchData();
  }, [user]);

  const calcPercentage = (history: any[]) => {
    const total = history.length;
    if (total === 0) return 0;
    const present = history.filter(h => h.status === 'Present' || h.status === 'OD').length;
    return Math.round((present / total) * 100);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Attendance Records</h1>
          <p className="text-slate-500 mt-1">Review the daily attendance records of your children.</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200">
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="font-bold text-slate-700 min-w-[120px] text-center">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading attendance data...</div>
      ) : children.length === 0 ? (
        <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">No children linked to your account.</div>
      ) : (
        children.map((child, i) => {
          const history = attendanceData[child._id] || [];
          const percent = calcPercentage(history);
          
          return (
            <motion.div key={child._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden mt-8">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-slate-800">{child.user?.name}'s Attendance</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-500">Overall:</span>
                  <span className={`text-lg font-bold ${percent >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>{percent}%</span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 bg-slate-200 gap-px">
                    {Array(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()).fill(null).map((_, i) => (
                      <div key={`blank-${i}`} className="bg-slate-50/50 min-h-[100px]" />
                    ))}
                    {Array.from({length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()}, (_, i) => {
                      const day = i + 1;
                      const paddedMonth = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
                      const paddedDay = day.toString().padStart(2, '0');
                      const dateStr = `${currentMonth.getFullYear()}-${paddedMonth}-${paddedDay}`;
                      
                      const record = history.find((h: any) => h.date.split('T')[0] === dateStr);
                      
                      let bgColor = 'bg-white';
                      let badge = null;
                      
                      if (record) {
                        if (record.status === 'Present') {
                          bgColor = 'bg-emerald-50';
                          badge = <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md uppercase mt-1"><CheckCircle2 className="w-3 h-3"/> Present</span>;
                        } else if (record.status === 'Absent') {
                          bgColor = 'bg-red-50';
                          badge = <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-1 rounded-md uppercase mt-1"><XCircle className="w-3 h-3"/> Absent</span>;
                        } else {
                          bgColor = 'bg-amber-50';
                          badge = <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-md uppercase mt-1"><Clock className="w-3 h-3"/> {record.status}</span>;
                        }
                      }

                      return (
                        <div key={day} className={`p-2 sm:p-3 min-h-[100px] flex flex-col items-start ${bgColor} hover:bg-slate-50 transition-colors`}>
                          <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${record ? 'text-slate-800' : 'text-slate-400'}`}>
                            {day}
                          </span>
                          <div className="mt-auto w-full">
                            {badge}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
