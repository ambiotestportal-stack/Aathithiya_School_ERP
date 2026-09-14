"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Calendar, Clock, Users, LayoutGrid, CalendarDays, User, BookOpen } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getSubjectColor = (name: string = '') => {
  const n = name.toLowerCase();
  if (n.includes('math')) return { bg: 'bg-emerald-50/80', border: 'border-emerald-200', text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-800' };
  if (n.includes('eng')) return { bg: 'bg-blue-50/80', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-800' };
  if (n.includes('sci') || n.includes('phys') || n.includes('chem') || n.includes('bio')) return { bg: 'bg-purple-50/80', border: 'border-purple-200', text: 'text-purple-800', badge: 'bg-purple-100 text-purple-800' };
  if (n.includes('hist') || n.includes('soc') || n.includes('geo')) return { bg: 'bg-amber-50/80', border: 'border-amber-200', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-800' };
  if (n.includes('art') || n.includes('music')) return { bg: 'bg-rose-50/80', border: 'border-rose-200', text: 'text-rose-800', badge: 'bg-rose-100 text-rose-800' };
  if (n.includes('comp') || n.includes('it') || n.includes('tech')) return { bg: 'bg-cyan-50/80', border: 'border-cyan-200', text: 'text-cyan-800', badge: 'bg-cyan-100 text-cyan-800' };
  return { bg: 'bg-indigo-50/80', border: 'border-indigo-200', text: 'text-indigo-800', badge: 'bg-indigo-100 text-indigo-800' };
};

const formatClassName = (name?: string, section?: string) => {
  if (!name) return section ? `Sec ${section}` : 'General';
  const cleanName = name.replace(/^class\s+/i, '').trim();
  return `Class ${cleanName}${section ? ` - ${section}` : ''}`;
};

export default function ParentTimetablePage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<any[]>([]);
  const [timetableData, setTimetableData] = useState<Record<string, any[]>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('grid');

  const todayName = (() => {
    const dayIndex = new Date().getDay();
    if (dayIndex === 0) return 'Monday';
    return DAYS[dayIndex - 1] || 'Monday';
  })();

  const [selectedDay, setSelectedDay] = useState(todayName);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const childrenRes = await api.get(`/api/students/children?parentId=${user?.id}`);
        const myChildren = childrenRes.data;
        setChildren(myChildren);
        
        const ttData: Record<string, any[]> = {};
        for (const child of myChildren) {
          if (child.enrolledClass?._id) {
            const res = await api.get(`/api/timetable?classId=${child.enrolledClass._id}`);
            ttData[child._id] = res.data;
          }
        }
        setTimetableData(ttData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="font-medium text-slate-600">Loading schedules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Class Schedules</h1>
          <p className="text-slate-500 mt-1">View weekly timetable boxes for your enrolled children.</p>
        </div>

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
        </div>
      </div>

      {children.length === 0 ? (
        <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">No children linked to your account.</div>
      ) : (
        children.map((child, i) => {
          const timetables = timetableData[child._id] || [];
          const presentPeriods = timetables.flatMap(t => (t.periods || []).map((p: any) => p.periodNumber)).filter(Boolean);
          const maxPeriodNum = presentPeriods.length > 0 ? Math.max(6, ...presentPeriods) : 6;
          const allPeriods = Array.from({ length: maxPeriodNum }, (_, idx) => idx + 1);

          return (
            <motion.div key={child._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b-2 border-indigo-100">
                <Users className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-slate-800">{child.user?.name}'s Schedule</h2>
                <span className="ml-auto text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl">
                  {formatClassName(child.enrolledClass?.name, child.enrolledClass?.section)}
                </span>
              </div>

              {viewMode === 'grid' ? (
                <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-left border-collapse min-w-[900px]">
                      <thead>
                        <tr className="bg-slate-50/90 border-b border-slate-200 text-xs text-slate-500 uppercase">
                          <th className="px-5 py-4 font-bold sticky left-0 bg-slate-100 z-10 border-r border-slate-200 w-32 text-center">Day</th>
                          {allPeriods.map(p => (
                            <th key={p} className="px-4 py-4 font-bold text-center border-r border-slate-200/60 min-w-[170px]">
                              <span className="text-indigo-600 font-black">Period {p}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {DAYS.map((day, idx) => {
                          const daySchedule = timetables.find(t => t.dayOfWeek === day);
                          const isCurrentDay = day === todayName;

                          return (
                            <tr key={day} className={`hover:bg-slate-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                              <td className={`px-4 py-4 font-bold text-center sticky left-0 z-10 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)] ${
                                isCurrentDay ? 'bg-indigo-50/90 text-indigo-700' : 'bg-white text-slate-700'
                              }`}>
                                <span>{day}</span>
                                {isCurrentDay && (
                                  <span className="block mt-1 text-[9px] font-extrabold bg-indigo-600 text-white px-1.5 py-0.2 rounded-full uppercase">Today</span>
                                )}
                              </td>

                              {allPeriods.map(p => {
                                const period = daySchedule?.periods?.find((per: any) => per.periodNumber === p);
                                const colors = period ? getSubjectColor(period.subject?.name) : null;

                                return (
                                  <td key={p} className="p-2.5 border-r border-slate-100 align-top">
                                    {period ? (
                                      <div className={`flex flex-col justify-between p-3.5 ${colors?.bg} rounded-2xl border ${colors?.border} h-full min-h-[105px] shadow-xs hover:shadow-md transition-all`}>
                                        <div>
                                          <span className="font-extrabold text-sm text-slate-900 block line-clamp-1 mb-1">{period.subject?.name}</span>
                                          <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-lg border border-slate-200/50 mb-1.5">
                                            <User className="w-3 h-3 text-slate-400" />
                                            <span className="truncate">{period.teacher?.name || 'Faculty'}</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1.5 border-t border-slate-200/40">
                                          <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            <span>{period.startTime} - {period.endTime}</span>
                                          </div>
                                          <span className="text-[10px] font-black text-slate-400">P{p}</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 min-h-[105px] h-full text-slate-300">
                                        <span className="text-xs font-semibold">No Class</span>
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
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex overflow-x-auto gap-2">
                    {DAYS.map(day => (
                      <button 
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`flex-1 min-w-[100px] px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                          selectedDay === day ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const daySchedule = timetables.find(t => t.dayOfWeek === selectedDay);
                    const periods = (daySchedule?.periods || []).slice().sort((a: any, b: any) => a.periodNumber - b.periodNumber);

                    if (periods.length === 0) {
                      return (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-sm">
                          No classes scheduled for {selectedDay}.
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {periods.map((period: any, pIdx: number) => {
                          const colors = getSubjectColor(period.subject?.name);
                          return (
                            <div key={period._id || pIdx} className={`p-4 rounded-2xl border ${colors.border} ${colors.bg} flex flex-col justify-between`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="px-2.5 py-0.5 bg-white font-black text-xs rounded-lg border border-slate-200">Period {period.periodNumber}</span>
                                <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-lg border border-slate-200/50">
                                  <Clock className="w-3 h-3 text-indigo-500" />
                                  <span>{period.startTime} - {period.endTime}</span>
                                </div>
                              </div>
                              <h3 className="text-lg font-black text-slate-900 mb-1">{period.subject?.name}</h3>
                              <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-2">
                                <User className="w-3.5 h-3.5 text-slate-400" /> Teacher: {period.teacher?.name || 'Faculty'}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </motion.div>
          );
        })
      )}
    </div>
  );
}
