"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Award, FileText } from 'lucide-react';

export default function StudentResultsPage() {
  const { user } = useAuthStore();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const profileRes = await api.get(`/api/students/me?userId=${user?.id}`);
        const profileId = profileRes.data._id;
        
        const resultsRes = await api.get(`/api/exams/student/${profileId}`);
        setResults(resultsRes.data);
      } catch (error) {
        console.error('Failed to fetch exam results', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchResults();
  }, [user]);

  // Group results by exam
  const groupedResults = results.reduce((acc: any, curr: any) => {
    const examId = curr.exam?._id;
    if (!acc[examId]) {
      acc[examId] = {
        examDetails: curr.exam,
        subjects: []
      };
    }
    acc[examId].subjects.push(curr);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Exam Results</h1>
        <p className="text-slate-500 mt-1">View your marks and performance across different exams.</p>
      </div>

      <div className="space-y-8">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading your results...</div>
        ) : Object.keys(groupedResults).length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 flex flex-col items-center">
            <Award className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-800">No Results Found</p>
            <p className="text-slate-500">Marks for your exams haven't been published yet.</p>
          </div>
        ) : (
          Object.values(groupedResults).map((group: any, idx) => {
            const { examDetails, subjects } = group;
            
            const totalObtained = subjects.reduce((sum: number, s: any) => sum + s.marksObtained, 0);
            const totalMax = subjects.reduce((sum: number, s: any) => sum + s.totalMarks, 0);
            const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0;
            
            return (
              <motion.div key={examDetails._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><FileText className="w-6 h-6"/></div>
                    <div>
                      <h3 className="text-xl font-bold">{examDetails.name}</h3>
                      <p className="text-blue-100 text-sm">{new Date(examDetails.startDate).toLocaleDateString()} to {new Date(examDetails.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md text-right border border-white/20">
                    <p className="text-xs text-blue-100 font-bold uppercase tracking-wider mb-1">Overall Performance</p>
                    <p className="text-2xl font-bold">{percentage}%</p>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Subject</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Marks</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Grade</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {subjects.map((s: any) => (
                        <tr key={s._id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-800">{s.subject?.name}</span>
                            <span className="ml-2 text-xs text-slate-400">({s.subject?.code})</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-bold text-slate-900 text-lg">{s.marksObtained}</span>
                            <span className="text-slate-400 text-sm"> / {s.totalMarks}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold border border-slate-200">{s.grade || '-'}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 italic">
                            {s.remarks || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
