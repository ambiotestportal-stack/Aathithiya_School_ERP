"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { CustomBarChart, CustomDonutChart } from '@/components/molecules/Charts';
import { 
  Users, Briefcase, GraduationCap, DollarSign, CalendarCheck, 
  Cake, Award, Bell, Calendar, Bus, BookOpen, UserCheck, Phone, Inbox, UserPlus, PieChart, CheckCircle2
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
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            School Analytics & Operational Insights • Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-3 shadow-sm">
          <CalendarCheck className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Pill Sub-Navigation Tab Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]'
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
                subtitle="Today's live student attendance breakdown"
                totalLabel="Students"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMIC (Spacious Soft UI Design) */}
      {activeTab === 'academic' && (
        <div className="space-y-8">
          {/* Header & KPI Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="soft-card p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Overall Attendance Rate</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">94.2%</p>
              <p className="text-[11px] font-semibold text-emerald-600 mt-1">High Daily Attendance</p>
            </div>
            <div className="soft-card p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Academic Classes</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">12 Classes</p>
              <p className="text-[11px] font-semibold text-indigo-600 mt-1">Grade 1 to Grade 12</p>
            </div>
            <div className="soft-card p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Enrolled Students</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{(stats.totalStudents || 0).toLocaleString()}</p>
              <p className="text-[11px] font-semibold text-purple-600 mt-1">Active Enrolment</p>
            </div>
            <div className="soft-card p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total New Admissions</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats.totalNewAdmissions || 0}</p>
              <p className="text-[11px] font-semibold text-emerald-600 mt-1">Current Academic Batch</p>
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

            {/* 2. Admissions Bar & Donut Charts */}
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

          {/* Academic Faculty Roster Table */}
          <div className="soft-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Academic Faculty Members</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Active class teachers and subject instructors</p>
                </div>
              </div>
            </div>

            {(!stats.topEmployees || stats.topEmployees.length === 0) ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">No faculty members registered in system</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700/60 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                      <th className="py-3 px-4">Emp ID</th>
                      <th className="py-3 px-4">Faculty Name</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4 text-right">Experience</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {stats.topEmployees.map((emp: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{emp.id}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{emp.name}</td>
                        <td className="py-3.5 px-4">{emp.designation}</td>
                        <td className="py-3.5 px-4">{emp.department}</td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">{emp.experience}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TRANSPORT (Spacious Soft UI Layout) */}
      {activeTab === 'transport' && (
        <div className="space-y-8">
          {/* Fleet KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="soft-card p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Fleet Vehicles</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {stats.transportRoutes && stats.transportRoutes.length > 0 ? `${stats.transportRoutes.length} Buses` : '0 Buses'}
              </p>
              <p className="text-[11px] font-semibold text-emerald-600 mt-1">Operational Fleet</p>
            </div>
            <div className="soft-card p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Routes</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {stats.transportRoutes && stats.transportRoutes.length > 0 ? `${stats.transportRoutes.length} Routes` : '0 Routes'}
              </p>
              <p className="text-[11px] font-semibold text-indigo-600 mt-1">City Wide Coverage</p>
            </div>
            <div className="soft-card p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Commuter Students</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {(stats.transportRoutes || []).reduce((acc: number, curr: any) => acc + (curr.studentCount || 0), 0)} Students
              </p>
              <p className="text-[11px] font-semibold text-purple-600 mt-1">Daily Bus Users</p>
            </div>
            <div className="soft-card p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Driver & Support Staff</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {stats.transportRoutes && stats.transportRoutes.length > 0 ? `${stats.transportRoutes.length} Drivers` : '0 Staff'}
              </p>
              <p className="text-[11px] font-semibold text-emerald-600 mt-1">Licensed Drivers</p>
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
