"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Book, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentLibraryPage() {
  const { user } = useAuthStore();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get(`/api/students/me?userId=${user?.id}`);
        const issueRes = await api.get(`/api/library/issues?studentId=${profileRes.data._id}`);
        setIssues(issueRes.data);
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
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Library</h1>
        <p className="text-slate-500 mt-1">Track your issued books and due dates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading library records...</div>
        ) : issues.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <Book className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p>You have not issued any books.</p>
          </div>
        ) : (
          issues.map((issue, i) => {
            const isOverdue = new Date(issue.dueDate) < new Date() && issue.status !== 'Returned';
            return (
              <motion.div key={issue._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${issue.status === 'Returned' ? 'bg-emerald-500' : isOverdue ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                <div className="p-5 pl-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{issue.book?.title}</h3>
                  <p className="text-sm text-slate-500 mb-4">{issue.book?.author}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Issued:</span>
                      <span className="font-medium">{new Date(issue.issueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Due:</span>
                      <span className={`font-bold ${isOverdue ? 'text-red-500' : 'text-slate-700'}`}>{new Date(issue.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold flex w-fit items-center gap-1.5 ${
                      issue.status === 'Returned' ? 'bg-emerald-100 text-emerald-700' :
                      isOverdue ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {issue.status === 'Returned' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {issue.status === 'Returned' ? 'Returned' : isOverdue ? 'Overdue' : 'Active'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
