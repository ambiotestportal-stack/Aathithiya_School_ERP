"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { CustomBarChart, CustomLineChart, CustomDonutChart } from '@/components/molecules/Charts';
import { Users, Wallet, CalendarCheck, BookOpen, GraduationCap } from 'lucide-react';

export default function ParentDashboard() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pendingFees: 0,
    unreadNotices: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const [childrenRes, noticesRes, feesRes] = await Promise.all([
          api.get(`/api/students/children?parentId=${user.id}`),
          api.get('/api/notices?targetAudience=Parents'),
          api.get('/api/finance/fees')
        ]);
        
        const myChildren = Array.isArray(childrenRes.data) ? childrenRes.data : [];
        setChildren(myChildren);
        
        const childIds = myChildren.map((c: any) => c._id);
        const allFees = Array.isArray(feesRes.data) ? feesRes.data : [];
        const pendingFees = allFees.filter((f: any) => childIds.includes(f.student?._id) && f.status !== 'Paid');
        const totalPending = pendingFees.reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
        const notices = Array.isArray(noticesRes.data) ? noticesRes.data : [];

        setStats({
          pendingFees: totalPending,
          unreadNotices: notices.length
        });
      } catch (err) {
        console.error('Error loading parent dashboard:', err);
      }
    };
    fetchData();
  }, [user?.id]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 }})
  };

  const childMarksData = [
    { label: 'Mathematics', value: 92, color: 'bg-indigo-500' },
    { label: 'Science', value: 88, color: 'bg-indigo-500' },
    { label: 'English', value: 95, color: 'bg-indigo-500' },
    { label: 'Social', value: 86, color: 'bg-indigo-500' },
    { label: 'Tamil', value: 90, color: 'bg-indigo-500' },
  ];

  const feeStatusDonut = [
    { label: 'Fees Paid', value: 1500, color: '#10b981' },
    { label: 'Pending Dues', value: stats.pendingFees || 200, color: '#f59e0b' },
  ];

  const childProgressTrend = [
    { label: 'Term 1', value: 84 },
    { label: 'Term 2', value: 89 },
    { label: 'Mid-Year', value: 92 },
    { label: 'Term 3', value: 90 },
    { label: 'Annual', value: 94 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome, {user?.name}!</h1>
        <p className="text-slate-500 mt-1">Overview of your children's academic performance, fee status, and attendance.</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">My Children</h3>
            <p className="text-3xl font-black mt-2 text-slate-900">{children.length || 1}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </motion.div>
        
        <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Pending Dues</h3>
            <p className="text-3xl font-black mt-2 text-amber-600">${stats.pendingFees.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </motion.div>
        
        <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Parent Notices</h3>
            <p className="text-3xl font-black mt-2 text-purple-600">{stats.unreadNotices}</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CustomBarChart
            data={childMarksData}
            title="Child's Subject Marks Performance (%)"
            subtitle="Recent score breakdown across all academic subjects"
          />
        </div>
        <div>
          <CustomDonutChart
            data={feeStatusDonut}
            title="Fee Payment Status"
            subtitle="Ratio of paid vs pending fees"
            totalLabel="USD ($)"
          />
        </div>
      </div>

      {/* Academic Performance Progression */}
      <div>
        <CustomLineChart
          data={childProgressTrend}
          title="Overall Academic Progress Trend (%)"
          subtitle="Term-by-term score improvement trajectory"
          color="#8b5cf6"
        />
      </div>

      {/* Children List */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-600" /> Linked Student Profiles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No children records linked to your account yet.
            </div>
          ) : children.map((child, i) => (
            <motion.div 
              key={child._id}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
            >
              <div className="h-16 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <div className="px-6 pb-6 relative flex-1">
                <div className="w-14 h-14 bg-white rounded-xl shadow-md absolute -top-7 flex items-center justify-center border border-slate-100">
                  <Users className="w-7 h-7 text-blue-500" />
                </div>
                <div className="pt-9">
                  <h3 className="text-lg font-bold text-slate-900">{child.user?.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">Class {child.enrolledClass?.name} - {child.enrolledClass?.section}</p>
                  
                  <div className="space-y-2 mt-auto">
                    <div className="flex justify-between text-sm py-2 border-t border-slate-100">
                      <span className="text-slate-500 font-medium">Roll No</span>
                      <span className="font-bold text-slate-700">{child.rollNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-t border-slate-100">
                      <span className="text-slate-500 font-medium">Admission No</span>
                      <span className="font-bold text-slate-700">{child.admissionNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
