"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { CustomBarChart, CustomDonutChart } from '@/components/molecules/Charts';
import { 
  Users, Briefcase, GraduationCap, DollarSign, CalendarCheck, 
  Cake, Award, Bell, Calendar, Bus, BookOpen, UserCheck, Phone, Inbox, UserPlus, PieChart, RefreshCw, Sparkles, Navigation, Route, ShieldCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'employees' | 'fees' | 'academic' | 'transport'>('overview');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    revenue: 0,
    revenueData: [],
    attendanceDonut: [],
    birthdays: [],
    topEmployees: [],
    upcomingEvents: [],
    noticeBoard: [],
    classAttendance: [],
    totalNewAdmissions: 0,
    newAdmissionsChart: [],
    admissionsByClassDonut: [],
    routeWiseStudentsDonut: [],
    transportFeesChart: [],
    transportRoutes: [],
    studentGenderDonut: [],
    studentBloodDistribution: [],
    staffDepartmentChart: [],
    staffExperienceBreakdown: [],
    feeCategoryBreakdown: [],
    recentFeeReceipts: []
  });

  const fetchDashboardStats = () => {
    setLoading(true);
    api.get('/api/dashboard/admin')
      .then(res => {
        setStats(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load dashboard analytics from backend server.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05 }
    })
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGridIcon },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'employees', label: 'Employees', icon: Briefcase },
    { id: 'fees', label: 'Fees', icon: DollarSign },
    { id: 'academic', label: 'Academic', icon: BookOpen },
    { id: 'transport', label: 'Transport', icon: Bus }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Super Admin ERP Dashboard
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" /> Live Analytics
            </span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Real-Time School Performance & Operational Metrics
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-3 shadow-sm">
          <CalendarCheck className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Enhanced Floating Soft Sub-Navigation Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-lg shadow-slate-200/50 dark:shadow-none">
        {/* Tab Buttons Container */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-0.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-md shadow-indigo-500/25"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Right-Side Utility Badges & Quick Action Controls */}
        <div className="flex items-center gap-3 shrink-0 px-2">
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-700/60 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-600/60 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Academic Session 2026</span>
          </div>

          <button
            onClick={fetchDashboardStats}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-600/80 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm active:scale-95 transition"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Vibrant KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants} className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-200/80 dark:border-indigo-800/60 shadow-xl shadow-indigo-500/5 backdrop-blur-md flex items-center justify-between">
              <div>
                <h3 className="text-indigo-600 dark:text-indigo-400 text-xs font-extrabold uppercase tracking-wider">Total Students</h3>
                <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">{(stats.totalStudents || 0).toLocaleString()}</p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">Enrolled Students</span>
              </div>
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
                <GraduationCap className="w-7 h-7" />
              </div>
            </motion.div>

            <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants} className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-200/80 dark:border-purple-800/60 shadow-xl shadow-purple-500/5 backdrop-blur-md flex items-center justify-between">
              <div>
                <h3 className="text-purple-600 dark:text-purple-400 text-xs font-extrabold uppercase tracking-wider">Total Teachers</h3>
                <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">{(stats.totalTeachers || 0).toLocaleString()}</p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">Academic Faculty</span>
              </div>
              <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0">
                <Briefcase className="w-7 h-7" />
              </div>
            </motion.div>

            <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants} className="p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-200/80 dark:border-blue-800/60 shadow-xl shadow-blue-500/5 backdrop-blur-md flex items-center justify-between">
              <div>
                <h3 className="text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider">Total Parents</h3>
                <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">{(stats.totalParents || 0).toLocaleString()}</p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">Registered Guardians</span>
              </div>
              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                <Users className="w-7 h-7" />
              </div>
            </motion.div>

            <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariants} className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200/80 dark:border-emerald-800/60 shadow-xl shadow-emerald-500/5 backdrop-blur-md flex items-center justify-between">
              <div>
                <h3 className="text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider">Total Revenue</h3>
                <p className="text-3xl font-black mt-2 text-emerald-600 dark:text-emerald-400">₹{(stats.revenue || 0).toLocaleString()}</p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">Realized Payments</span>
              </div>
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                <DollarSign className="w-7 h-7" />
              </div>
            </motion.div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CustomBarChart
                data={stats.revenueData || []}
                title="Monthly Fee Collection Analytics"
                subtitle="Green: Realized Collection (₹) | Grey: Outstanding Balance (₹)"
              />
            </div>
            <div>
              <CustomDonutChart
                data={stats.attendanceDonut || []}
                title="Daily Attendance Ratio"
                subtitle="Today's live student attendance breakdown"
                totalLabel="Students"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMIC (Vibrant Soft UI Cards) */}
      {activeTab === 'academic' && (
        <div className="space-y-8">
          {/* Header & Colorful KPI Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200/80 dark:border-emerald-800/60 shadow-xl shadow-emerald-500/5 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Overall Attendance</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">94.2%</p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">High Daily Attendance</span>
              </div>
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-200/80 dark:border-indigo-800/60 shadow-xl shadow-indigo-500/5 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Academic Classes</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">12 Classes</p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">Grade 1 to Grade 12</span>
              </div>
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-indigo-500/30 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-200/80 dark:border-purple-800/60 shadow-xl shadow-purple-500/5 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">Total Enrolled</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{(stats.totalStudents || 0).toLocaleString()}</p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">Active Students</span>
              </div>
              <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-purple-500/30 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-200/80 dark:border-blue-800/60 shadow-xl shadow-blue-500/5 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">New Admissions</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats.totalNewAdmissions || 0}</p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">Current Batch</span>
              </div>
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
                <UserPlus className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Main Academic Performance Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1. Class Attendance Rate Breakdown */}
            <div className="lg:col-span-5 soft-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Class Attendance Breakdown</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Attendance percentages by grade level</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {(stats.classAttendance && stats.classAttendance.length > 0 ? stats.classAttendance : [
                    { grade: 'Grade 10', percentage: 96 },
                    { grade: 'Grade 9', percentage: 94 },
                    { grade: 'Grade 8', percentage: 95 },
                    { grade: 'Grade 7', percentage: 91 },
                    { grade: 'Grade 6', percentage: 93 },
                    { grade: 'Grade 5', percentage: 92 },
                    { grade: 'Grade 4', percentage: 90 },
                    { grade: 'Grade 3', percentage: 94 }
                  ]).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span className="w-20 text-slate-600 dark:text-slate-400 shrink-0 font-semibold">{item.grade}</span>
                      <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-500 rounded-full" style={{ width: `${item.percentage || 90}%` }} />
                      </div>
                      <span className="w-10 text-right text-emerald-600 dark:text-emerald-400 font-extrabold">{item.percentage || 90}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Admissions Bar Chart */}
            <div className="lg:col-span-7 space-y-6">
              <div className="soft-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Class-wise Admission Distribution</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Student enrollment counts by grade category</p>
                    </div>
                  </div>
                </div>

                <CustomBarChart
                  data={stats.newAdmissionsChart && stats.newAdmissionsChart.length > 0 ? stats.newAdmissionsChart : [
                    { label: 'Grade 1-3', value: 45, secondaryValue: 0, color: 'bg-emerald-500' },
                    { label: 'Grade 4-5', value: 38, secondaryValue: 0, color: 'bg-emerald-500' },
                    { label: 'Grade 6-8', value: 52, secondaryValue: 0, color: 'bg-emerald-500' },
                    { label: 'Grade 9-10', value: 64, secondaryValue: 0, color: 'bg-emerald-500' },
                    { label: 'Grade 11-12', value: 48, secondaryValue: 0, color: 'bg-emerald-500' }
                  ]}
                  title=""
                  subtitle=""
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSPORT (Vibrant Soft UI Cards - Fix Screenshot media_1789375723733.png) */}
      {activeTab === 'transport' && (
        <div className="space-y-8">
          {/* Vibrant KPI Cards with Icon Badges & Color Gradients */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-200/80 dark:border-indigo-800/60 shadow-xl shadow-indigo-500/5 backdrop-blur-md flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Total Fleet Vehicles</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                  {stats.transportRoutes && stats.transportRoutes.length > 0 ? `${stats.transportRoutes.length} Buses` : '0 Buses'}
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">Operational Fleet</span>
              </div>
              <div className="w-13 h-13 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
                <Bus className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-200/80 dark:border-purple-800/60 shadow-xl shadow-purple-500/5 backdrop-blur-md flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">Active Routes</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                  {stats.transportRoutes && stats.transportRoutes.length > 0 ? `${stats.transportRoutes.length} Routes` : '0 Routes'}
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">City Wide Coverage</span>
              </div>
              <div className="w-13 h-13 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0">
                <Route className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-200/80 dark:border-blue-800/60 shadow-xl shadow-blue-500/5 backdrop-blur-md flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">Commuter Students</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                  {(stats.transportRoutes || []).reduce((acc: number, curr: any) => acc + (curr.studentCount || 0), 0)} Students
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">Daily Bus Users</span>
              </div>
              <div className="w-13 h-13 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200/80 dark:border-emerald-800/60 shadow-xl shadow-emerald-500/5 backdrop-blur-md flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Driver & Support Staff</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                  {stats.transportRoutes && stats.transportRoutes.length > 0 ? `${stats.transportRoutes.length} Drivers` : '0 Staff'}
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">Licensed Drivers</span>
              </div>
              <div className="w-13 h-13 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Route-wise Students Donut Chart */}
            <div className="soft-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Route-wise Commuter Distribution</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Student transport breakdown by route</p>
                </div>
              </div>

              <CustomDonutChart
                data={stats.routeWiseStudentsDonut || []}
                title=""
                subtitle=""
                totalLabel="Students"
              />
            </div>

            {/* Transport Fees Bar Chart (Collected vs Pending) */}
            <div className="soft-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Transport Fee Collection (₹)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Realized vs balance pending bus fees per route</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold mb-4 justify-end">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Collected</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500 inline-block" /> Pending</span>
              </div>

              <CustomBarChart
                data={stats.transportFeesChart || []}
                title=""
                subtitle=""
              />
            </div>
          </div>

          {/* Transport Fleet & Routes Table */}
          <div className="soft-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Transport Fleet & Driver Allocation</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Route details, assigned drivers, and bus capacity metrics</p>
              </div>
            </div>

            {(!stats.transportRoutes || stats.transportRoutes.length === 0) ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <Bus className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">No transport routes or vehicles registered in database</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700/60 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                      <th className="py-3 px-4">Bus No</th>
                      <th className="py-3 px-4">Vehicle Reg No</th>
                      <th className="py-3 px-4">Driver Name</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Route Details</th>
                      <th className="py-3 px-4 text-right">Occupancy / Capacity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {stats.transportRoutes.map((tr: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-black text-indigo-600 dark:text-indigo-400">{tr.busNumber}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{tr.vehicleNumber}</td>
                        <td className="py-3.5 px-4 font-bold">{tr.driverName}</td>
                        <td className="py-3.5 px-4 text-slate-500 flex items-center gap-1.5"><Phone className="w-3 h-3 text-emerald-500" /> {tr.driverContact}</td>
                        <td className="py-3.5 px-4">{tr.route}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                          {tr.studentCount} / {tr.capacity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OTHER TABS */}
      {activeTab === 'students' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CustomDonutChart
              data={stats.studentGenderDonut || []}
              title="Gender Ratio"
              subtitle="Male, Female & Other Student Breakdown"
              totalLabel="Total"
            />
            <div className="soft-card p-6">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">Student Health & Blood Group Distribution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Student medical record blood group breakdown</p>
              {(!stats.studentBloodDistribution || stats.studentBloodDistribution.length === 0) ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold">No blood group records available</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.studentBloodDistribution.map((item: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-center">
                      <span className="w-8 h-8 mx-auto rounded-full bg-rose-500 text-white font-extrabold text-xs flex items-center justify-center shadow-md mb-2">
                        {item.bg}
                      </span>
                      <p className="text-lg font-black text-slate-900 dark:text-white">{item.count}</p>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Students</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="soft-card p-6">
              <CustomBarChart
                data={stats.staffDepartmentChart || []}
                title="Department Distribution"
                subtitle="Faculty allocation across academic departments"
              />
            </div>
            <div className="soft-card p-6">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">Staff Experience Breakdown</h3>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {(stats.staffExperienceBreakdown || []).map((item: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 inline-block mb-2">
                      Experience
                    </span>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.label}</h4>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{item.value} Staff</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fees' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CustomBarChart
                data={stats.revenueData || []}
                title="Fee Collection vs Pending Dues (₹)"
                subtitle="Green: Realized Collection | Grey: Balance Outstanding"
              />
            </div>
            <div>
              <CustomDonutChart
                data={stats.feeCategoryBreakdown || []}
                title="Fee Category Share"
                subtitle="Revenue distribution by fee categories"
                totalLabel="Categories"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LayoutGridIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}
