"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { CustomBarChart, CustomDonutChart } from '@/components/molecules/Charts';
import { 
  Users, Briefcase, GraduationCap, DollarSign, CalendarCheck, 
  Cake, Award, Bell, Calendar, Bus, BookOpen, CheckCircle2, Phone, Inbox
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
    studentBloodDistribution: [],
    staffDepartmentChart: [],
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
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mt-1">Real Database Analytics & Operational Metrics</p>
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
                subtitle="Green: Realized Collection ($) | Grey: Outstanding Balance ($)"
              />
            </div>
            <div>
              <CustomDonutChart
                data={stats.attendanceDonut || []}
                title="Daily Attendance Ratio"
                subtitle="Today's live attendance breakdown"
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
                    <p className="text-xs text-slate-500 dark:text-slate-400">Student & staff birthdays today</p>
                  </div>
                </div>

                {(!stats.birthdays || stats.birthdays.length === 0) ? (
                  <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                    <Cake className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-semibold">No birthdays today</p>
                  </div>
                ) : (
                  <div className="space-y-3 mt-4">
                    {stats.birthdays.map((person: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                        <div className="flex items-center gap-3">
                          <img src={person.avatar} alt={person.name} className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/30" />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{person.name}</p>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">{person.role} ({person.class})</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top Employee Report Table */}
            <div className="lg:col-span-2 soft-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Academic Faculty Staff</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Registered staff profiles in system</p>
                  </div>
                </div>
              </div>

              {(!stats.topEmployees || stats.topEmployees.length === 0) ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold">No staff profiles registered yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700/60 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                        <th className="py-2.5 px-3">Emp ID</th>
                        <th className="py-2.5 px-3">Name</th>
                        <th className="py-2.5 px-3">Designation</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3 text-right">Experience</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {stats.topEmployees.map((emp: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 px-3 font-mono text-indigo-600 dark:text-indigo-400">{emp.id}</td>
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{emp.name}</td>
                          <td className="py-3 px-3">{emp.designation}</td>
                          <td className="py-3 px-3">{emp.department}</td>
                          <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{emp.experience}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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

              {(!stats.upcomingEvents || stats.upcomingEvents.length === 0) ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold">No upcoming events scheduled</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.upcomingEvents.map((ev: any, idx: number) => (
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
              )}
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

              {(!stats.noticeBoard || stats.noticeBoard.length === 0) ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold">No active notices posted</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.noticeBoard.map((nt: any, idx: number) => (
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
              )}
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
                subtitle="Enrolment breakdown across enrolled classes"
              />
            </div>
          </div>

          <div className="soft-card p-6">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">Student Health & Blood Group Distribution</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Real student medical record blood group breakdown</p>

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
      )}

      {/* TAB 3: EMPLOYEES (STAFF) */}
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
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">Staff Teaching Experience Breakdown</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Recorded experience levels of faculty members</p>

              <div className="grid grid-cols-2 gap-4">
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
                subtitle="Revenue distribution by fee categories"
                totalLabel="Categories"
              />
            </div>
          </div>

          {/* Recent Receipts Table */}
          <div className="soft-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Fee Transactions</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Payment records saved in system</p>
              </div>
            </div>

            {(!stats.recentFeeReceipts || stats.recentFeeReceipts.length === 0) ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">No fee payment receipts recorded yet</p>
              </div>
            ) : (
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
                    {stats.recentFeeReceipts.map((rec: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{rec.receiptNo}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{rec.studentName}</td>
                        <td className="py-3.5 px-4 font-mono">{rec.rollNo}</td>
                        <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400">{rec.amount}</td>
                        <td className="py-3.5 px-4">{rec.mode}</td>
                        <td className="py-3.5 px-4 text-slate-500">{rec.date}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3" /> {rec.status}
                          </span>
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

      {/* TAB 5: ACADEMIC */}
      {activeTab === 'academic' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="soft-card p-6">
              <CustomBarChart
                data={stats.academicPassRatios || []}
                title="Class Pass Ratio (%)"
                subtitle="Real examination pass percentage by class"
              />
            </div>

            <div className="soft-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Top Performing Students</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Exam performance records</p>
                </div>
              </div>

              {(!stats.topPerformers || stats.topPerformers.length === 0) ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold">No examination results evaluated yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700/60 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                        <th className="py-2.5 px-3">Rank</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Roll No</th>
                        <th className="py-2.5 px-3">Class</th>
                        <th className="py-2.5 px-3 text-right">Marks %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {stats.topPerformers.map((tp: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 px-3 font-black text-amber-500">#{tp.rank}</td>
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{tp.name}</td>
                          <td className="py-3 px-3 font-mono">{tp.rollNo}</td>
                          <td className="py-3 px-3">{tp.class}</td>
                          <td className="py-3 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">{tp.percentage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: TRANSPORT */}
      {activeTab === 'transport' && (
        <div className="space-y-8">
          <div className="soft-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Transport Fleet & Route Allocation</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Registered transport vehicles & driver contacts in database</p>
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
            )}
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
