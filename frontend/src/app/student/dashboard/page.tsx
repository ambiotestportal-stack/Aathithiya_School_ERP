"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { CustomBarChart, CustomLineChart, CustomDonutChart } from '@/components/molecules/Charts';
import { CalendarCheck, BookOpen, Wallet, Award, TrendingUp } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    attendance: '95%',
    pendingFees: '$0',
    upcomingExams: 2,
    unreadNotices: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, noticesRes, feesRes] = await Promise.all([
          api.get(`/api/students/me?userId=${user?.id}`),
          api.get('/api/notices?targetAudience=Students'),
          api.get('/api/finance/fees')
        ]);
        
        setProfile(profileRes.data);
        if (!profileRes.data) return;
        
        const myFees = feesRes.data.filter((f: any) => f.student?._id === profileRes.data._id && f.status !== 'Paid');
        const totalPending = myFees.reduce((sum: number, f: any) => sum + f.amount, 0);

        setStats({
          attendance: '95%',
          pendingFees: `$${totalPending}`,
          upcomingExams: 2,
          unreadNotices: noticesRes.data.length
        });
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.id) fetchData();
  }, [user]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 }})
  };

  const subjectScoresData = [
    { label: 'English', value: 88, color: 'bg-blue-500' },
    { label: 'Mathematics', value: 94, color: 'bg-indigo-500' },
    { label: 'Science', value: 90, color: 'bg-emerald-500' },
    { label: 'Social Studies', value: 85, color: 'bg-amber-500' },
    { label: 'Tamil', value: 92, color: 'bg-purple-500' },
  ];

  const attendanceRatio = [
    { label: 'Days Present', value: 180, color: '#10b981' },
    { label: 'Days Absent', value: 6, color: '#ef4444' },
    { label: 'On Leave', value: 4, color: '#f59e0b' },
  ];

  const scoreProgression = [
    { label: 'Unit 1', value: 82 },
    { label: 'Unit 2', value: 86 },
    { label: 'Mid-Term', value: 90 },
    { label: 'Unit 3', value: 88 },
    { label: 'Final Term', value: 94 },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        {profile ? (
          <p className="text-blue-100 text-lg">
            Class {profile.enrolledClass?.name || 'Class 1'} - Section {profile.enrolledClass?.section || 'A'} | Roll No: {profile.rollNumber || '1234'}
          </p>
        ) : (
          <p className="text-blue-100 text-lg">Class 1 - Section A | Roll No: 1234</p>
        )}
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><CalendarCheck className="w-8 h-8"/></div>
          <div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Attendance</h3>
            <p className="text-2xl font-bold text-slate-900">{stats.attendance}</p>
          </div>
        </motion.div>
        
        <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><Wallet className="w-8 h-8"/></div>
          <div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pending Fees</h3>
            <p className="text-2xl font-bold text-slate-900">{stats.pendingFees}</p>
          </div>
        </motion.div>
        
        <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Award className="w-8 h-8"/></div>
          <div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Upcoming Exams</h3>
            <p className="text-2xl font-bold text-slate-900">{stats.upcomingExams}</p>
          </div>
        </motion.div>
        
        <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><BookOpen className="w-8 h-8"/></div>
          <div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">New Notices</h3>
            <p className="text-2xl font-bold text-slate-900">{stats.unreadNotices}</p>
          </div>
        </motion.div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CustomBarChart
            data={subjectScoresData}
            title="Subject-wise Marks Performance (%)"
            subtitle="Recent examination score breakdown by subject"
          />
        </div>
        <div>
          <CustomDonutChart
            data={attendanceRatio}
            title="Attendance Summary"
            subtitle="Days present, absent, and on leave"
            totalLabel="Days"
          />
        </div>
      </div>

      {/* Score Progression Graph */}
      <div>
        <CustomLineChart
          data={scoreProgression}
          title="Overall Score Growth Trend (%)"
          subtitle="Progressive term-by-term grade average progression"
          color="#10b981"
        />
      </div>
    </div>
  );
}
