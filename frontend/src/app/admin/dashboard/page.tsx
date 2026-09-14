"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { CustomBarChart, CustomDonutChart } from '@/components/molecules/Charts';
import { 
  Users, Briefcase, GraduationCap, DollarSign, CalendarCheck, 
  Cake, Award, Bell, Calendar, Bus, BookOpen, UserCheck, ShieldCheck, CheckCircle2, ChevronRight, Phone
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
    studentGenderDonut: [],
    studentClassDistribution: [],
    studentCommunityDistribution: [],
    staffDepartmentChart: [],
    staffGenderDonut: [],
    staffExperienceBreakdown: [],
    feeCategoryBreakdown: [],
    recentFeeReceipts: [],
    academicPassRatios: [],
    topPerformers: [],
    transportRoutes: []
  });

  useEffect(() => {
    api.get('/api/dashboard/admin')
      .then(res => setStats(res.data))
      .catch((err) => {
        console.error(err);
        setError('Failed to load dashboard data. Please verify your backend server connection.');
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
    { id: 'fees', label: 'Fees & Accounts', icon: DollarSign },
    { id: 'academic', label: 'Academic', icon: BookOpen },
    { id: 'transport', label: 'Transport', icon: Bus }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Super Admin ERP Dashboard</h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mt-1">Multi-Tab School Performance & Operational Analytics</p>
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
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md shadow-indigo-500/10 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-700/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-white' : 'text-slate-500'}`} />
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
                <p className="text-3xl font-black mt-2 text-emerald-600 dark:text-emerald-400">${(stats.revenue || 0).toLocaleString()}</p>
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
                subtitle="Green: Collected ($) | Grey: Pending ($)"
              />
            </div>
            <div>
              <CustomDonutChart
                data={stats.attendanceDonut || []}
                title="Daily Attendance Ratio"
                subtitle="Real-time today's student attendance breakdown"
                totalLabel="Students"
              />
            </div>
          </div>

          {/* Widgets Grid: Birthdays & Top Employees */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Birthdays Widget */}
            <div className="soft-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-200/60 dark:border-pink-800/60">
                    <Cake className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Today's Birthdays</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Celebrate student & staff birthdays today</p>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  {(stats.birthdays || []).map((person: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center gap-3">
                        <img src={person.avatar} alt={person.name} className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/30" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{person.name}</p>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">{person.role} ({person.class})</span>
                        </div>
                      </div>
                      <button className="px-3 py-1 text-[11px] font-bold rounded-lg bg-pink-500 hover:bg-pink-600 text-white shadow-sm transition">
                        Wish 🎂
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top 5 Employee Report Table */}
            <div className="lg:col-span-2 soft-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Top 5 Employee Report</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">High performing faculty & academic staff members</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700/60 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                      <th className="py-2.5 px-3">Emp ID</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Designation</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3 text-right">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {(stats.topEmployees || []).map((emp: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3 font-mono text-indigo-600 dark:text-indigo-400">{emp.id}</td>
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{emp.name}</td>
                        <td className="py-3 px-3">{emp.designation}</td>
                        <td className="py-3 px-3">{emp.department}</td>
                        <td className="py-3 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">{emp.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Events & Notice Board Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Events */}
            <div className="soft-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Upcoming Events</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled school activities & examinations</p>
                </div>
              </div>

              <div className="space-y-3">
                {(stats.upcomingEvents || []).map((ev: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ev.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{ev.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 block mb-1">{ev.type}</span>
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{ev.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notice Board */}
            <div className="soft-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Notice Board</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Latest announcements and circulars</p>
                </div>
              </div>

              <div className="space-y-3">
                {(stats.noticeBoard || []).map((nt: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{nt.title}</h4>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">{nt.audience}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{nt.content}</p>
                    <span className="text-[10px] text-slate-400 block mt-2">{nt.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS */}
      {activeTab === 'students' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <CustomDonutChart
                data={stats.studentGenderDonut || []}
                title="Gender Ratio"
                subtitle="Male, Female & Other Student Breakdown"
                totalLabel="Total"
              />
            </div>
            <div className="lg:col-span-2">
              <CustomBarChart
                data={stats.studentClassDistribution || []}
                title="Class-Wise Student Distribution"
                subtitle="Enrolment breakdown across primary & secondary grades"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="soft-card p-6">
              <CustomDonutChart
                data={stats.studentCommunityDistribution || []}
                title="Category / Community Breakdown"
                subtitle="Distribution across General, OBC, SC/ST categories"
                totalLabel="Category"
              />
            </div>

            <div className="soft-card p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">Student Health & Blood Group Distribution</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Medical records blood group counts for emergency quick access</p>

                <div className="grid grid-cols-4 gap-4">
                  {[
                    { bg: 'O+', count: 480, color: 'bg-rose-500' },
                    { bg: 'A+', count: 390, color: 'bg-indigo-500' },
                    { bg: 'B+', count: 410, color: 'bg-purple-500' },
                    { bg: 'AB+', count: 120, color: 'bg-emerald-500' },
                    { bg: 'O-', count: 45, color: 'bg-rose-600' },
                    { bg: 'A-', count: 30, color: 'bg-indigo-600' },
                    { bg: 'B-', count: 25, color: 'bg-purple-600' },
                    { bg: 'AB-', count: 10, color: 'bg-emerald-600' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-center">
                      <span className={`w-8 h-8 mx-auto rounded-full ${item.color} text-white font-extrabold text-xs flex items-center justify-center shadow-md mb-2`}>
                        {item.bg}
                      </span>
                      <p className="text-lg font-black text-slate-900 dark:text-white">{item.count}</p>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Students</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EMPLOYEES (STAFF) */}
      {activeTab === 'employees' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CustomBarChart
                data={stats.staffDepartmentChart || []}
                title="Department Distribution"
                subtitle="Faculty allocation across academic departments"
              />
            </div>
            <div>
              <CustomDonutChart
                data={stats.staffGenderDonut || []}
                title="Staff Gender Ratio"
                subtitle="Female vs Male Staff Ratio"
                totalLabel="Staff"
              />
            </div>
          </div>

          <div className="soft-card p-6">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">Staff Teaching Experience Breakdown</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Experience level metrics of faculty members</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { exp: '0 - 2 Years', count: '15 Staff', percentage: '19.4%', color: 'from-blue-500 to-indigo-600' },
                { exp: '3 - 5 Years', count: '28 Staff', percentage: '36.3%', color: 'from-indigo-500 to-purple-600' },
                { exp: '6 - 10 Years', count: '22 Staff', percentage: '28.5%', color: 'from-purple-500 to-pink-600' },
                { exp: '10+ Years', count: '12 Staff', percentage: '15.8%', color: 'from-emerald-500 to-teal-600' },
              ].map((item, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex flex-col justify-between">
                  <div>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg text-white bg-gradient-to-r ${item.color} shadow-sm inline-block mb-3`}>
                      Experience
                    </span>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white">{item.exp}</h4>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">{item.count}</p>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-4">Share: {item.percentage}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FEES & ACCOUNTS */}
      {activeTab === 'fees' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CustomBarChart
                data={stats.revenueData || []}
                title="Fee Collection vs Pending Dues ($)"
                subtitle="Green: Realized Collection | Grey: Balance Outstanding"
              />
            </div>
            <div>
              <CustomDonutChart
                data={stats.feeCategoryBreakdown || []}
                title="Fee Category Share"
                subtitle="Revenue distribution by fee types"
                totalLabel="Categories"
              />
            </div>
          </div>

          {/* Recent Receipts Table */}
          <div className="soft-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Recent Fee Collection Receipts</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Real-time payment transactions recorded in the system</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700/60 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                    <th className="py-3 px-4">Receipt No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {(stats.recentFeeReceipts || []).map((rec: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{rec.receiptNo}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{rec.studentName}</td>
                      <td className="py-3.5 px-4 font-mono">{rec.rollNo}</td>
                      <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400">{rec.amount}</td>
                      <td className="py-3.5 px-4">{rec.mode}</td>
                      <td className="py-3.5 px-4 text-slate-500">{rec.date}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ACADEMIC */}
      {activeTab === 'academic' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CustomBarChart
                data={stats.academicPassRatios || []}
                title="Class Examination Pass Percentage (%)"
                subtitle="Grade-wise student academic passing statistics"
              />
            </div>

            <div className="soft-card p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">Subject Performance Matrix</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Average score percentage by subject</p>

                <div className="space-y-4">
                  {[
                    { subject: 'Mathematics', avg: '88%', color: 'bg-indigo-500' },
                    { subject: 'Science & Physics', avg: '92%', color: 'bg-emerald-500' },
                    { subject: 'English Literature', avg: '95%', color: 'bg-violet-500' },
                    { subject: 'Tamil', avg: '94%', color: 'bg-amber-500' },
                    { subject: 'Social Studies', avg: '89%', color: 'bg-pink-500' },
                  ].map((sub, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <span>{sub.subject}</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{sub.avg}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className={`h-full ${sub.color}`} style={{ width: sub.avg }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Students */}
          <div className="soft-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Top Performing Students</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Highest academic scorers across all examination terms</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700/60 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Marks %</th>
                    <th className="py-3 px-4 text-right">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {(stats.topPerformers || []).map((tp: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-black text-amber-500">#{tp.rank}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{tp.name}</td>
                      <td className="py-3.5 px-4 font-mono">{tp.rollNo}</td>
                      <td className="py-3.5 px-4">{tp.class}</td>
                      <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400">{tp.percentage}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                          {tp.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: TRANSPORT */}
      {activeTab === 'transport' && (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="soft-card p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Fleet Vehicles</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">12 Buses</p>
              <p className="text-[11px] font-semibold text-emerald-600 mt-1">100% Operational</p>
            </div>
            <div className="soft-card p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Routes</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">15 Routes</p>
              <p className="text-[11px] font-semibold text-indigo-600 mt-1">City Wide Coverage</p>
            </div>
            <div className="soft-card p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Transport Students</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">420 Students</p>
              <p className="text-[11px] font-semibold text-purple-600 mt-1">Daily Commuters</p>
            </div>
            <div className="soft-card p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Driver & Support Staff</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">14 Staff</p>
              <p className="text-[11px] font-semibold text-emerald-600 mt-1">Licensed Drivers</p>
            </div>
          </div>

          {/* Transport Routes Table */}
          <div className="soft-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Transport Fleet & Route Allocation</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">School bus routes, assigned drivers, and student capacity details</p>
              </div>
            </div>

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
                  {(stats.transportRoutes || []).map((tr: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-black text-indigo-600 dark:text-indigo-400">{tr.busNumber}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{tr.vehicleNumber}</td>
                      <td className="py-3.5 px-4">{tr.driverName}</td>
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
