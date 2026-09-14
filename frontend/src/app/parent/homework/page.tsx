"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, Clock, FileText, CheckCircle2, Users } from 'lucide-react';

export default function ParentHomeworkPage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<any[]>([]);
  const [homeworkData, setHomeworkData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const childrenRes = await api.get(`/api/students/children?parentId=${user?.id}`);
        const myChildren = childrenRes.data;
        setChildren(myChildren);
        
        const hwData: Record<string, any[]> = {};
        for (const child of myChildren) {
          if (child.enrolledClass?._id) {
            const res = await api.get(`/api/homework?classId=${child.enrolledClass._id}`);
            hwData[child._id] = res.data;
          }
        }
        setHomeworkData(hwData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchData();
  }, [user]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Homework Monitoring</h1>
        <p className="text-slate-500 mt-1">Keep track of your children's daily assignments.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading homework records...</div>
      ) : children.length === 0 ? (
        <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">No children linked to your account.</div>
      ) : (
        children.map((child, i) => {
          const assignments = homeworkData[child._id] || [];
          const sortedHw = [...assignments].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
          
          return (
            <motion.div key={child._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="mt-8">
              <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-slate-800">{child.user?.name}'s Tasks</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedHw.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <p>No active homework assigned.</p>
                  </div>
                ) : (
                  sortedHw.map((hw: any) => {
                    const isOverdue = new Date(hw.dueDate) < new Date() && new Date(hw.dueDate).toDateString() !== new Date().toDateString();
                    
                    return (
                      <div key={hw._id} className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden flex flex-col relative">
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${isOverdue ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
                        <div className="p-5 flex-1">
                          <div className="mb-3">
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                              {hw.subject?.name}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-bold text-slate-900 mb-2">{hw.title}</h3>
                          <p className="text-sm text-slate-600 mb-4 whitespace-pre-wrap">{hw.description}</p>
                          
                          <div className={`flex items-center gap-2 text-sm mt-auto pt-4 border-t border-slate-100 ${isOverdue ? 'text-red-500 font-bold' : 'text-slate-500 font-medium'}`}>
                            <Clock className="w-4 h-4" />
                            <span>Due: {new Date(hw.dueDate).toLocaleDateString()} {isOverdue && '(Overdue)'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
