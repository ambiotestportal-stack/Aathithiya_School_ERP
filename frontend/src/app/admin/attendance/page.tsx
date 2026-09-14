"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';

export default function AttendancePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any>(null); // isNew, students[] or records[]
  const [attendanceState, setAttendanceState] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch classes for dropdown
    api.get('/api/academic/classes').then(res => setClasses(res.data)).catch(console.error);
  }, []);

  const fetchAttendance = async () => {
    if (!selectedClass || !date) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/attendance?classId=${selectedClass}&date=${date}`);
      const data = res.data;
      setAttendanceData(data);
      
      const newState: Record<string, string> = {};
      if (data.isNew) {
        // Init all as Present or unrecorded
        data.students.forEach((s: any) => {
          newState[s._id] = 'Unrecorded';
        });
      } else {
        // Load existing
        data.records.forEach((r: any) => {
          newState[r.student._id] = r.status;
        });
      }
      setAttendanceState(newState);
    } catch (error) {
      console.error('Failed to fetch attendance', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass) fetchAttendance();
  }, [selectedClass, date]);

  // Helper for rendering rows based on whether it's new or existing
  const studentsList = attendanceData?.isNew ? attendanceData.students : attendanceData?.records?.map((r: any) => ({ ...r.student, status: r.status }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Daily Attendance Monitor</h1>
        <p className="text-slate-500 mt-1">View and monitor student attendance records marked by class teachers.</p>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-end gap-4">
        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Class</label>
          <select 
            className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white outline-none"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Choose Class --</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name} - Sec {c.section}</option>)}
          </select>
        </div>
        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
          <input 
            type="date" 
            className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white outline-none"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading attendance data...</div>
      ) : selectedClass && studentsList ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 gap-4">
            <div>
              <h3 className="font-bold text-slate-800">
                {attendanceData?.isNew ? 'No Attendance Recorded Yet' : 'Attendance Records'}
              </h3>
              <p className="text-sm text-slate-500">{studentsList.length} Students</p>
            </div>
            
            {/* Display counts */}
            {!attendanceData?.isNew && (
              <div className="flex gap-4">
                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 text-sm font-bold">
                   <CheckCircle2 className="w-4 h-4" /> Present: {Object.values(attendanceState).filter(s => s === 'Present').length}
                 </div>
                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-bold">
                   <XCircle className="w-4 h-4" /> Absent: {Object.values(attendanceState).filter(s => s === 'Absent').length}
                 </div>
                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 text-sm font-bold">
                   <Clock className="w-4 h-4" /> OD: {Object.values(attendanceState).filter(s => s === 'OD').length}
                 </div>
              </div>
            )}

            {attendanceData?.isNew && (
              <div className="px-3 py-1 bg-amber-50 text-amber-600 font-medium text-sm rounded-lg border border-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Not marked by teacher
              </div>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Student Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Roll No</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {studentsList.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-500">No students enrolled in this class.</td></tr>
                ) : (
                  studentsList.map((student: any) => {
                    const status = attendanceState[student._id];
                    return (
                      <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3">
                          <div className="font-bold text-slate-900">{student.user?.name}</div>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-600 font-mono">{student.rollNumber || 'N/A'}</td>
                        <td className="px-6 py-3 text-right">
                          <div className="inline-flex items-center justify-end">
                            {status === 'Present' && (
                              <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Present
                              </span>
                            )}
                            {status === 'Absent' && (
                              <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-100 text-red-700 border border-red-200">
                                <XCircle className="w-3.5 h-3.5" /> Absent
                              </span>
                            )}
                            {status === 'OD' && (
                              <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-100 text-amber-700 border border-amber-200">
                                <Clock className="w-3.5 h-3.5" /> OD
                              </span>
                            )}
                            {status === 'Unrecorded' && (
                              <span className="text-slate-400 text-sm font-medium italic">Unrecorded</span>
                            )}
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
      ) : (
        <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No Class Selected</h3>
          <p className="text-slate-500">Please select a class and date to view attendance.</p>
        </div>
      )}
    </div>
  );
}
