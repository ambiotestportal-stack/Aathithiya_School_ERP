"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { CheckCircle2, XCircle, Clock, CalendarCheck } from 'lucide-react';

export default function StudentAttendancePage() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const profileRes = await api.get(`/api/students/me?userId=${user?.id}`);
        const profileId = profileRes.data._id;
        
        const historyRes = await api.get(`/api/attendance/student/${profileId}`);
        setHistory(historyRes.data);
      } catch (error) {
        console.error('Failed to fetch attendance history', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchHistory();
  }, [user]);

  const totalDays = history.length;
  const presentDays = history.filter(h => h.status === 'Present').length;
  const odDays = history.filter(h => h.status === 'OD').length;
  const absentDays = history.filter(h => h.status === 'Absent').length;
  
  const attendancePercentage = totalDays === 0 ? 0 : Math.round(((presentDays + odDays) / totalDays) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Attendance</h1>
        <p className="text-slate-500 mt-1">Review your daily attendance records and aggregate percentage.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
          <p className="text-sm font-bold text-slate-500 uppercase">Total Days</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{totalDays}</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center">
          <p className="text-sm font-bold text-emerald-800 uppercase">Present</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{presentDays}</p>
        </div>
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 text-center">
          <p className="text-sm font-bold text-amber-800 uppercase">OD</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{odDays}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
          <p className="text-sm font-bold text-red-800 uppercase">Absent</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{absentDays}</p>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between text-white">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
            <CalendarCheck className="w-10 h-10 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Overall Attendance</h3>
            <p className="text-slate-400 text-sm mt-1">Must maintain above 75% for exams</p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 text-right">
          <div className={`text-5xl font-bold ${attendancePercentage >= 75 ? 'text-emerald-400' : 'text-red-400'}`}>
            {attendancePercentage}%
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden mt-8 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 text-lg">Attendance Calendar</h3>
          <div className="flex items-center gap-4">
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
          <div className="py-12 text-center text-slate-500">Loading calendar...</div>
        ) : (
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
                // Pad month and day with leading zero to ensure correct matching
                const paddedMonth = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
                const paddedDay = day.toString().padStart(2, '0');
                const dateStr = `${currentMonth.getFullYear()}-${paddedMonth}-${paddedDay}`;
                
                const record = history.find(h => h.date.split('T')[0] === dateStr);
                
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
        )}
      </motion.div>
    </div>
  );
}
