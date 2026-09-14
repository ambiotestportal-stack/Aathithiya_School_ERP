"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Calendar, Clock, BookOpen, Layers, LayoutGrid, CalendarDays, CheckCircle, User, Sparkles } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getSubjectColor = (name: string = '') => {
  const n = name.toLowerCase();
  if (n.includes('math')) return { bg: 'bg-emerald-50/80', hover: 'hover:bg-emerald-100/70', border: 'border-emerald-200', text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-800' };
  if (n.includes('eng')) return { bg: 'bg-blue-50/80', hover: 'hover:bg-blue-100/70', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-800' };
  if (n.includes('sci') || n.includes('phys') || n.includes('chem') || n.includes('bio')) return { bg: 'bg-purple-50/80', hover: 'hover:bg-purple-100/70', border: 'border-purple-200', text: 'text-purple-800', badge: 'bg-purple-100 text-purple-800' };
  if (n.includes('hist') || n.includes('soc') || n.includes('geo')) return { bg: 'bg-amber-50/80', hover: 'hover:bg-amber-100/70', border: 'border-amber-200', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-800' };
  if (n.includes('art') || n.includes('music')) return { bg: 'bg-rose-50/80', hover: 'hover:bg-rose-100/70', border: 'border-rose-200', text: 'text-rose-800', badge: 'bg-rose-100 text-rose-800' };
  if (n.includes('comp') || n.includes('it') || n.includes('tech')) return { bg: 'bg-cyan-50/80', hover: 'hover:bg-cyan-100/70', border: 'border-cyan-200', text: 'text-cyan-800', badge: 'bg-cyan-100 text-cyan-800' };
  return { bg: 'bg-indigo-50/80', hover: 'hover:bg-indigo-100/70', border: 'border-indigo-200', text: 'text-indigo-800', badge: 'bg-indigo-100 text-indigo-800' };
};

const formatClassName = (name?: string, section?: string) => {
  if (!name) return section ? `Sec ${section}` : 'General';
  const cleanName = name.replace(/^class\s+/i, '').trim();
  return `Class ${cleanName}${section ? ` - ${section}` : ''}`;
};

export default function StudentTimetablePage() {
  const { user } = useAuthStore();
  const [timetable, setTimetable] = useState<any[]>([]);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'cards' | 'dayBoxes'>('grid');

  const todayName = (() => {
    const dayIndex = new Date().getDay();
    if (dayIndex === 0) return 'Monday';
    return DAYS[dayIndex - 1] || 'Monday';
  })();

  const [selectedDay, setSelectedDay] = useState(todayName);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, profileRes] = await Promise.all([
          api.get('/api/settings'),
          api.get(`/api/students/me?userId=${user?.id}`)
        ]);
        
        setIsVisible(settingsRes.data.showTimetableToStudents !== false);
        setStudentProfile(profileRes.data);
        
        const classId = profileRes.data.enrolledClass?._id;
        
        if (classId && settingsRes.data.showTimetableToStudents !== false) {
          const res = await api.get(`/api/timetable?classId=${classId}`);
          setTimetable(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchData();
  }, [user]);

  // Determine periods: range from 1 to max(6, maxPeriodFound)
  const presentPeriods = timetable.flatMap(t => (t.periods || []).map((p: any) => p.periodNumber)).filter(Boolean);
  const maxPeriodNum = presentPeriods.length > 0 ? Math.max(6, ...presentPeriods) : 6;
  const allPeriods = Array.from({ length: maxPeriodNum }, (_, i) => i + 1);

  // Flatten all classes scheduled across all days
  const allScheduledPeriods = timetable.flatMap(t => 
    (t.periods || []).map((per: any) => ({
      ...per,
      dayOfWeek: t.dayOfWeek
    }))
  );

  const todayClassesCount = allScheduledPeriods.filter(c => c.dayOfWeek === todayName).length;
  const totalClassesCount = allScheduledPeriods.length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="font-medium text-slate-600">Loading your class schedule...</p>
      </div>
    );
  }

  if (!isVisible) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto mt-12 text-center">
        <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-700">Timetable Unavailable</h2>
        <p className="text-slate-500">The timetable is currently hidden by the school administration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Class Timetable</h1>
          <p className="text-slate-500 mt-1">
            Weekly schedule for <span className="font-bold text-indigo-600">{formatClassName(studentProfile?.enrolledClass?.name, studentProfile?.enrolledClass?.section)}</span>
          </p>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Box Matrix (Grid)
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CalendarDays className="w-4 h-4" /> Day by Day
          </button>
          <button
            onClick={() => setViewMode('dayBoxes')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              viewMode === 'dayBoxes' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" /> All Days Cards
          </button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weekly Classes</p>
            <p className="text-xl font-bold text-slate-900">{totalClassesCount} Periods</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Classes ({todayName})</p>
            <p className="text-xl font-bold text-slate-900">{todayClassesCount} Classes</p>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Class Enrolled</p>
            <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              {formatClassName(studentProfile?.enrolledClass?.name, studentProfile?.enrolledClass?.section)}
            </p>
          </div>
        </div>
      </div>

      {/* 1. VIEW MODE: WEEKLY BOX MATRIX (GRID) */}
      {viewMode === 'grid' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Class Timetable Matrix</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">{maxPeriodNum} Periods / Day</span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <th className="px-5 py-4 font-bold sticky left-0 bg-slate-100 z-10 border-r border-slate-200 w-32 text-center">
                    Day
                  </th>
                  {allPeriods.map(p => (
                    <th key={p} className="px-4 py-4 font-bold text-center border-r border-slate-200/60 min-w-[170px]">
                      <div className="flex flex-col items-center">
                        <span className="text-indigo-600 font-black tracking-wide">Period {p}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DAYS.map((day, idx) => {
                  const daySchedule = timetable.find(t => t.dayOfWeek === day);
                  const isCurrentDay = day === todayName;

                  return (
                    <tr key={day} className={`hover:bg-slate-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                      {/* Day Label Box */}
                      <td className={`px-4 py-4 font-bold text-center sticky left-0 z-10 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)] ${
                        isCurrentDay ? 'bg-indigo-50/90 text-indigo-700' : 'bg-white text-slate-700'
                      }`}>
                        <div className="flex flex-col items-center justify-center">
                          <span>{day}</span>
                          {isCurrentDay && (
                            <span className="mt-1 text-[10px] font-extrabold bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Today
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Period Boxes */}
                      {allPeriods.map(p => {
                        const period = daySchedule?.periods?.find((per: any) => per.periodNumber === p);
                        const colors = period ? getSubjectColor(period.subject?.name) : null;

                        return (
                          <td key={p} className="p-2.5 border-r border-slate-100 align-top">
                            {period ? (
                              <div className={`flex flex-col justify-between p-3.5 ${colors?.bg} ${colors?.hover} rounded-2xl border ${colors?.border} h-full min-h-[110px] shadow-xs hover:shadow-md transition-all group`}>
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-1.5">
                                    <span className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1">
                                      {period.subject?.name || 'Subject'}
                                    </span>
                                    {period.subject?.code && (
                                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${colors?.badge}`}>
                                        {period.subject.code}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-white/80 border border-slate-200/50 rounded-lg px-2 py-1 mb-2">
                                    <User className="w-3 h-3 text-slate-400" />
                                    <span className="truncate">{period.teacher?.name || 'Faculty'}</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-200/40 text-[11px] font-bold text-slate-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>{period.startTime} - {period.endTime}</span>
                                  </div>
                                  <span className="text-[10px] font-black text-slate-400">P{p}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 min-h-[110px] h-full text-slate-300 group hover:border-slate-300 transition-colors">
                                <span className="text-xs font-semibold text-slate-300 group-hover:text-slate-400">No Class</span>
                                <span className="text-[10px] text-slate-300 font-mono mt-0.5">Free Slot</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* 2. VIEW MODE: DAY BY DAY CARDS */}
      {viewMode === 'cards' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Day Selector Pills */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex overflow-x-auto gap-2">
            {DAYS.map(day => {
              const isSelected = selectedDay === day;
              const isToday = day === todayName;
              const daySchedule = timetable.find(t => t.dayOfWeek === day);
              const dayCount = (daySchedule?.periods || []).length;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-bold text-sm transition-all flex flex-col items-center justify-center ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{day}</span>
                    {isToday && (
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase ${
                        isSelected ? 'bg-white text-indigo-600' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        Today
                      </span>
                    )}
                  </div>
                  <span className={`text-xs mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {dayCount} {dayCount === 1 ? 'Period' : 'Periods'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Day's Period Boxes */}
          {(() => {
            const daySchedule = timetable.find(t => t.dayOfWeek === selectedDay);
            const periods = (daySchedule?.periods || []).slice().sort((a: any, b: any) => a.periodNumber - b.periodNumber);

            if (periods.length === 0) {
              return (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
                  <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-700">No Classes Scheduled</h3>
                  <p className="text-sm text-slate-400 mt-1">You have no classes scheduled for {selectedDay}.</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {periods.map((period: any, i: number) => {
                  const colors = getSubjectColor(period.subject?.name);

                  return (
                    <motion.div
                      key={period._id || i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-5 rounded-2xl border ${colors.border} ${colors.bg} shadow-sm flex flex-col justify-between hover:shadow-md transition-all`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 bg-white/90 border border-slate-200 text-slate-900 rounded-xl font-black text-xs">
                            Period {period.periodNumber}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/50">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{period.startTime} - {period.endTime}</span>
                          </div>
                        </div>

                        <h3 className="text-xl font-black text-slate-900 mb-1">{period.subject?.name || 'Subject'}</h3>
                        {period.subject?.code && (
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${colors.badge} inline-block mb-3`}>
                            {period.subject.code}
                          </span>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-200/60 mt-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher:</span>
                        <span className="text-sm font-bold text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-600" />
                          {period.teacher?.name || 'Faculty'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* 3. VIEW MODE: ALL DAYS CARDS */}
      {viewMode === 'dayBoxes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DAYS.map(day => {
            const daySchedule = timetable.find(t => t.dayOfWeek === day);
            const periods = (daySchedule?.periods || []).slice().sort((a: any, b: any) => a.periodNumber - b.periodNumber);
            const isToday = day === todayName;

            return (
              <div 
                key={day} 
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col justify-between ${
                  isToday ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200'
                }`}
              >
                <div className={`px-5 py-3.5 border-b flex items-center justify-between ${isToday ? 'bg-indigo-50/70 border-indigo-100' : 'bg-slate-50/70 border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-slate-900">{day}</span>
                    {isToday && (
                      <span className="text-[10px] font-extrabold bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {periods.length} {periods.length === 1 ? 'Class' : 'Classes'}
                  </span>
                </div>

                <div className="p-4 space-y-2.5 flex-1">
                  {periods.length === 0 ? (
                    <div className="py-8 text-center text-xs font-semibold text-slate-400 italic">No classes scheduled</div>
                  ) : (
                    periods.map((period: any) => {
                      const colors = getSubjectColor(period.subject?.name);
                      return (
                        <div key={period._id} className={`p-3 rounded-xl border ${colors.border} ${colors.bg} flex items-center justify-between`}>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-slate-900">{period.subject?.name}</span>
                              <span className="text-[10px] font-bold text-slate-500 bg-white/70 px-1.5 py-0.5 rounded">
                                {period.teacher?.name || 'Faculty'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                              {period.startTime} - {period.endTime}
                            </div>
                          </div>
                          <span className="text-xs font-black text-indigo-700 bg-white px-2 py-1 rounded-lg border border-slate-200">
                            P{period.periodNumber}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
