"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Award, FileText, Users } from 'lucide-react';

export default function ParentPerformancePage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<any[]>([]);
  const [resultsData, setResultsData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const childrenRes = await api.get(`/api/students/children?parentId=${user?.id}`);
        const myChildren = childrenRes.data;
        setChildren(myChildren);
        
        const resData: Record<string, any[]> = {};
        for (const child of myChildren) {
          const res = await api.get(`/api/exams/student/${child._id}`);
          resData[child._id] = res.data;
        }
        setResultsData(resData);
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
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Performance</h1>
        <p className="text-slate-500 mt-1">Review exam results and report cards for your children.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading academic records...</div>
      ) : children.length === 0 ? (
        <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">No children linked to your account.</div>
      ) : (
        children.map((child, i) => {
          const childResults = resultsData[child._id] || [];
          
          // Group by exam
          const grouped = childResults.reduce((acc: any, curr: any) => {
            const examId = curr.exam?._id;
            if (!acc[examId]) acc[examId] = { examDetails: curr.exam, subjects: [] };
            acc[examId].subjects.push(curr);
            return acc;
          }, {});

          return (
            <motion.div key={child._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="mt-12">
              <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-slate-800">{child.user?.name}'s Records</h2>
              </div>
              
              {Object.keys(grouped).length === 0 ? (
                 <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
                   No exam results published yet.
                 </div>
              ) : (
                <div className="space-y-6">
                  {Object.values(grouped).map((group: any) => {
                    const { examDetails, subjects } = group;
                    const totalObtained = subjects.reduce((sum: number, s: any) => sum + s.marksObtained, 0);
                    const totalMax = subjects.reduce((sum: number, s: any) => sum + s.totalMarks, 0);
                    const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0;
                    
                    return (
                      <div key={examDetails._id} className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 flex justify-between items-center border-b border-slate-100">
                          <div>
                            <h3 className="font-bold text-slate-900">{examDetails.name}</h3>
                            <p className="text-sm text-slate-500">Conducted {new Date(examDetails.startDate).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Overall</span>
                            <div className={`text-xl font-bold ${Number(percentage) >= 75 ? 'text-emerald-600' : Number(percentage) >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                              {percentage}%
                            </div>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-white">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Subject</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Marks</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Grade</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {subjects.map((s: any) => (
                                <tr key={s._id}>
                                  <td className="px-6 py-3 font-medium text-slate-800">{s.subject?.name}</td>
                                  <td className="px-6 py-3 text-center">
                                    <span className="font-bold text-slate-900">{s.marksObtained}</span>
                                    <span className="text-slate-400 text-sm"> / {s.totalMarks}</span>
                                  </td>
                                  <td className="px-6 py-3 text-center font-bold text-slate-700">{s.grade || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })
      )}
    </div>
  );
}
