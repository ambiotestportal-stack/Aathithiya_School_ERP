"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { CustomBarChart, CustomLineChart, CustomDonutChart } from '@/components/molecules/Charts';
import { Users, BookOpen, FileText, Calendar, CheckCircle } from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    myClasses: 0,
    upcomingExams: 0,
    unreadNotices: 0
  });

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      try {
        const [classesRes, noticesRes, staffRes] = await Promise.all([
          api.get('/api/academic/classes'),
          api.get('/api/notices?targetAudience=Teachers'),
          api.get('/api/staff')
        ]);
        
        const myStaffProfile = staffRes.data.find((s: any) => s.user?._id === user?.id || s.user === user?.id);
        const assignedClassIds = (myStaffProfile?.assignedClasses || []).map((c: any) => c._id || c);

        const myClassesCount = classesRes.data.filter((c: any) => 
          c.classTeacher?._id === user?.id || 
          c.classTeacher === user?.id ||
          assignedClassIds.includes(c._id)
        ).length;
        
        setStats({
          myClasses: myClassesCount || 2,
          upcomingExams: 2,
          unreadNotices: noticesRes.data.length
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data.');
      }
    };
    fetchData();
  }, [user]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 }})
  };

  const homeworkSubmissionData = [
    { label: 'Class 8-A', value: 34, secondaryValue: 6, color: 'bg-indigo-500' },
    { label: 'Class 6-F', value: 28, secondaryValue: 4, color: 'bg-indigo-500' },
    { label: 'Class 7-B', value: 30, secondaryValue: 8, color: 'bg-indigo-500' },
    { label: 'Class 9-C', value: 35, secondaryValue: 3, color: 'bg-indigo-500' },
  ];

  const attendanceRatio = [
    { label: 'Present Students', value: 120, color: '#10b981' },
    { label: 'Absent Students', value: 8, color: '#ef4444' },
    { label: 'On Leave', value: 5, color: '#f59e0b' },
  ];

  const classPerformanceTrend = [
    { label: 'Test 1', value: 72 },
    { label: 'Test 2', value: 78 },
    { label: 'Mid-Term', value: 84 },
    { label: 'Test 3', value: 81 },
    { label: 'Revision', value: 88 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome, {user?.name}!</h1>
        <p className="text-slate-500 mt-1">Overview of your taught classes, homework submissions, and student performance.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-3">
          <BookOpen className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Assigned Classes</h3>
            <p className="text-3xl font-black mt-2 text-indigo-600">{stats.myClasses}</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </motion.div>
        
        <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Staff Notices</h3>
            <p className="text-3xl font-black mt-2 text-amber-600">{stats.unreadNotices}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </motion.div>
        
        <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Upcoming Exams</h3>
            <p className="text-3xl font-black mt-2 text-emerald-600">{stats.upcomingExams}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CustomBarChart
            data={homeworkSubmissionData}
            title="Homework Submission Status"
            subtitle="Indigo: Submitted | Grey: Pending Submissions"
          />
        </div>
        <div>
          <CustomDonutChart
            data={attendanceRatio}
            title="Class Attendance Ratio"
            subtitle="Overall attendance across your assigned classes"
            totalLabel="Students"
          />
        </div>
      </div>

      {/* Average Performance Trend */}
      <div>
        <CustomLineChart
          data={classPerformanceTrend}
          title="Average Class Performance Progression (%)"
          subtitle="Progressive test score averages for taught classes"
          color="#6366f1"
        />
      </div>
    </div>
  );
}
