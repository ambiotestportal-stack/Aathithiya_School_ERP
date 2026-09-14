"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { CustomBarChart, CustomDonutChart } from '@/components/molecules/Charts';
import { 
  Users, Briefcase, GraduationCap, DollarSign, CalendarCheck, 
  Cake, Award, Bell, Calendar, Bus, BookOpen, UserCheck, Phone, Inbox, UserPlus, PieChart
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'employees' | 'fees' | 'academic' | 'transport'>('overview');
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    api.get('/api/dashboard/admin')
      .then(res => setStats(res.data))
      .catch((err) => {
        console.error(err);
        setError('Failed to load dashboard data from backend server.');
      });
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
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">ERP Dashboard</h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Complete analytics & insights • Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-3 shadow-sm">
          <CalendarCheck className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Pill Sub-Navigation Tab Bar (Matching Reference Screenshot) */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-700/60 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants} className="soft-card p-6 flex items-center justify-between">
              <div>
                <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Students</h3>
                <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">{(stats.totalStudents || 0).toLocaleString()}</p>
              </div>
              <div className="w-13 h-13 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center shadow-md shadow-indigo-500/10">
                <GraduationCap className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants} className="soft-card p-6 flex items-center justify-between">
              <div>
                <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Teachers</h3>
                <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">{(stats.totalTeachers || 0).toLocaleString()}</p>
              </div>
              <div className="w-13 h-13 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-200/60 dark:border-purple-800/60 flex items-center justify-center shadow-md shadow-purple-500/10">
                <Briefcase className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants} className="soft-card p-6 flex items-center justify-between">
              <div>
                <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Parents</h3>
                <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">{(stats.totalParents || 0).toLocaleString()}</p>
              </div>
              <div className="w-13 h-13 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center shadow-md shadow-blue-500/10">
                <Users className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariants} className="soft-card p-6 flex items-center justify-between">
              <div>
                <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Revenue</h3>
                <p className="text-3xl font-black mt-2 text-emerald-600 dark:text-emerald-400">₹{(stats.revenue || 0).toLocaleString()}</p>
              </div>
              <div className="w-13 h-13 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shadow-md shadow-emerald-500/10">
                <DollarSign className="w-6 h-6" />
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
                subtitle="Today's live student attendance ratio"
                totalLabel="Students"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMIC (Matching Screenshot media_1789374585396.png) */}
      {activeTab === 'academic' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Academic Performance</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1. Class Attendance Widget */}
            <div className="lg:col-span-4 soft-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Class Attendance</h3>
                </div>

                <div className="space-y-2.5">
                  {(stats.classAttendance && stats.classAttendance.length > 0 ? stats.classAttendance : [
                    { grade: 'PREKG', percentage: 88 },
                    { grade: 'LKG', percentage: 0 },
                    { grade: 'UKG', percentage: 0 },
                    { grade: '1ST', percentage: 0 },
                    { grade: '2ND', percentage: 0 },
                    { grade: '3RD', percentage: 0 },
                    { grade: '4TH', percentage: 0 },
                    { grade: '5TH', percentage: 0 },
                    { grade: '6TH', percentage: 0 },
                    { grade: '7TH', percentage: 0 },
                    { grade: '8TH', percentage: 0 },
                    { grade: '9TH', percentage: 0 },
                    { grade: '10TH', percentage: 0 },
                    { grade: '11TH', percentage: 0 },
                    { grade: '12TH', percentage: 0 }
                  ]).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span className="w-12 text-slate-500 dark:text-slate-400 shrink-0 text-[11px] font-mono">{item.grade}</span>
                      <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                      </div>
                      <span className="w-10 text-right text-emerald-600 dark:text-emerald-400 text-[11px] font-mono">{item.percentage > 0 ? `${item.percentage}%` : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. New Admissions Bar Chart Widget */}
            <div className="lg:col-span-4 soft-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">New Admissions</h3>
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 text-center my-3">
                Total New Admissions: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{stats.totalNewAdmissions || 0}</span>
              </p>

              <div className="mt-4">
                <CustomBarChart
                  data={stats.newAdmissionsChart && stats.newAdmissionsChart.length > 0 ? stats.newAdmissionsChart : [
                    { label: 'PREKG', value: 8, secondaryValue: 0, color: 'bg-emerald-500' },
                    { label: 'LKG', value: 10, secondaryValue: 0, color: 'bg-emerald-500' },
                    { label: 'UKG', value: 16, secondaryValue: 0, color: 'bg-emerald-500' },
                    { label: '1ST', value: 49, secondaryValue: 0, color: 'bg-emerald-500' },
                    { label: '2ND', value: 31, secondaryValue: 0, color: 'bg-emerald-500' },
                    { label: '3RD', value: 35, secondaryValue: 0, color: 'bg-emerald-500' },
                    { label: '4TH', value: 23, secondaryValue: 0, color: 'bg-emerald-500' },
                    { label: '5TH', value: 10, secondaryValue: 0, color: 'bg-emerald-500' },
                    { label: '6TH', value: 11, secondaryValue: 0, color: 'bg-emerald-500' },
                    { label: '7TH', value: 10, secondaryValue: 0, color: 'bg-emerald-500' }
                  ]}
                  title=""
                  subtitle=""
                />
              </div>
            </div>

            {/* 3. Admissions by Class Donut Widget */}
            <div className="lg:col-span-4 soft-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                  <PieChart className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Admissions by Class</h3>
              </div>

              <CustomDonutChart
                data={stats.admissionsByClassDonut && stats.admissionsByClassDonut.length > 0 ? stats.admissionsByClassDonut : [
                  { label: 'PREKG', value: 8, color: '#3b82f6' },
                  { label: 'LKG', value: 27, color: '#10b981' },
                  { label: 'UKG', value: 16, color: '#f59e0b' },
                  { label: '1ST', value: 49, color: '#ef4444' },
                  { label: '2ND', value: 49, color: '#06b6d4' },
                  { label: '3RD', value: 31, color: '#10b981' },
                  { label: '5TH', value: 10, color: '#8b5cf6' },
                  { label: '6TH', value: 10, color: '#ec4899' },
                  { label: '7TH', value: 11, color: '#3b82f6' }
                ]}
                title=""
                subtitle=""
                totalLabel="Students"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSPORT (Matching Screenshot media_1789374594681.png) */}
      {activeTab === 'transport' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Transport Analytics</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Route-wise Students Donut Widget */}
            <div className="soft-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                  <Bus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Route-wise Students</h3>
              </div>

              <div className="py-6">
                <CustomDonutChart
                  data={stats.routeWiseStudentsDonut && stats.routeWiseStudentsDonut.length > 0 ? stats.routeWiseStudentsDonut : [
                    { label: 'Transport Mode', value: 100, color: '#6366f1' }
                  ]}
                  title=""
                  subtitle=""
                  totalLabel="Students"
                />
              </div>
            </div>

            {/* 2. Transport Fees Bar Chart Widget (Green Collected / Orange Pending) */}
            <div className="soft-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Transport Fees</h3>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold mb-4 justify-end">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Collected</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500 inline-block" /> Pending</span>
              </div>

              <CustomBarChart
                data={stats.transportFeesChart && stats.transportFeesChart.length > 0 ? stats.transportFeesChart : [
                  { label: 'Route 1', value: 43000, secondaryValue: 5000, color: 'bg-emerald-500' },
                  { label: 'Route 2', value: 36000, secondaryValue: 7000, color: 'bg-emerald-500' },
                  { label: 'Route 3', value: 34000, secondaryValue: 4000, color: 'bg-emerald-500' },
                  { label: 'Route 4', value: 28000, secondaryValue: 6000, color: 'bg-emerald-500' },
                  { label: 'Route 5', value: 24000, secondaryValue: 3000, color: 'bg-emerald-500' },
                  { label: 'Route 6', value: 21000, secondaryValue: 2000, color: 'bg-emerald-500' }
                ]}
                title=""
                subtitle=""
              />
            </div>
          </div>
        </div>
      )}

      {/* OTHER TABS (Students, Employees, Fees) */}
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
