"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { CustomBarChart, CustomLineChart, CustomDonutChart } from '@/components/molecules/Charts';
import { Users, Briefcase, GraduationCap, DollarSign, TrendingUp, CalendarCheck } from 'lucide-react';

export default function AdminDashboard() {
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    revenue: 0,
    revenueData: [],
    attendanceDonut: [],
    enrollmentTrend: []
  });

  useEffect(() => {
    api.get('/api/dashboard/admin')
      .then(res => setStats(res.data))
      .catch((err) => {
        console.error(err);
        setError('Failed to load dashboard data. Please try again later.');
      });
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08 }
    })
  };

  const revenueData = stats.revenueData && stats.revenueData.length > 0 ? stats.revenueData : [
    { label: 'Jan', value: 0, secondaryValue: 0, color: 'bg-emerald-500' }
  ];

  const attendanceDonut = stats.attendanceDonut && stats.attendanceDonut.length > 0 ? stats.attendanceDonut : [
    { label: 'Present Students', value: 0, color: '#10b981' },
    { label: 'Absent Students', value: 0, color: '#ef4444' },
    { label: 'On Leave', value: 0, color: '#f59e0b' },
  ];

  const enrollmentTrend = stats.enrollmentTrend && stats.enrollmentTrend.length > 0 ? stats.enrollmentTrend : [
    { label: new Date().getFullYear().toString(), value: 0 }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Super Admin Dashboard</h1>
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mt-1">School Performance & Metrics Overview</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-3 shadow-sm">
          <CalendarCheck className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Soft KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants} className="soft-card p-6 flex items-center justify-between">
          <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Students</h3>
            <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">{stats.totalStudents || 0}</p>
          </div>
          <div className="w-13 h-13 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center shadow-md shadow-indigo-500/10">
            <GraduationCap className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants} className="soft-card p-6 flex items-center justify-between">
          <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Teachers</h3>
            <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">{stats.totalTeachers || 0}</p>
          </div>
          <div className="w-13 h-13 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-200/60 dark:border-purple-800/60 flex items-center justify-center shadow-md shadow-purple-500/10">
            <Briefcase className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants} className="soft-card p-6 flex items-center justify-between">
          <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Parents</h3>
            <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">{stats.totalParents || 0}</p>
          </div>
          <div className="w-13 h-13 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center shadow-md shadow-blue-500/10">
            <Users className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariants} className="soft-card p-6 flex items-center justify-between">
          <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Revenue</h3>
            <p className="text-3xl font-black mt-2 text-emerald-600 dark:text-emerald-400">${(stats.revenue || 0).toLocaleString()}</p>
          </div>
          <div className="w-13 h-13 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shadow-md shadow-emerald-500/10">
            <DollarSign className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CustomBarChart
            data={revenueData}
            title="Monthly Fee Collection Analytics"
            subtitle="Green: Collected ($) | Grey: Pending ($)"
          />
        </div>
        <div>
          <CustomDonutChart
            data={attendanceDonut}
            title="Daily Attendance Ratio"
            subtitle="Real-time today's student attendance breakdown"
            totalLabel="Students"
          />
        </div>
      </div>

      {/* Enrollment Growth Trend */}
      <div>
        <CustomLineChart
          data={enrollmentTrend}
          title="Yearly Student Enrollment Growth"
          subtitle="6-Year historical enrollment numbers across all batches"
          color="#6366f1"
        />
      </div>
    </div>
  );
}

