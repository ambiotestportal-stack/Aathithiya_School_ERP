"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Eye, Users, BookOpen } from 'lucide-react';

export default function TeacherClassesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const [classesRes, staffRes] = await Promise.all([
          api.get('/api/academic/classes'),
          api.get('/api/staff')
        ]);
        
        // Find this user's staff profile to get their assigned classes
        const myProfile = staffRes.data.find((s: any) => s.user?._id === user?.id || s.user === user?.id);
        const assignedClassIds = myProfile?.assignedClasses?.map((c: any) => c._id || c) || [];

        // Filter classes where this user is the class teacher OR it's in their assignedClasses array
        const myClasses = classesRes.data.filter((c: any) => 
          c.classTeacher?._id === user?.id || 
          c.classTeacher === user?.id ||
          assignedClassIds.includes(c._id)
        );
        
        setClasses(myClasses);
      } catch (error) {
        console.error('Failed to fetch classes', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchClasses();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Classes</h1>
        <p className="text-slate-500 mt-1">Classes you are assigned to teach.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading your classes...</div>
        ) : classes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 flex flex-col items-center">
            <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
            <p>You are not assigned to teach any class.</p>
          </div>
        ) : (
          classes.map((c, i) => (
            <motion.div 
              key={c._id}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col items-center text-center"
            >
              <div className="p-6 flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{c.name}</h3>
                <p className="text-lg font-medium text-slate-500 mb-4">Section {c.section}</p>
                
                <div className="w-full pt-4 border-t border-slate-100 flex justify-between items-center px-2">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Capacity</span>
                  <span className="text-sm font-bold text-slate-800">{c.capacity} Students</span>
                </div>
              </div>
              <div className="w-full bg-slate-50 border-t border-slate-200 p-3 flex justify-center">
                <button 
                  onClick={() => router.push(`/teacher/classes/${c._id}`)}
                  className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors w-full justify-center"
                >
                  <Eye className="w-4 h-4" /> View Details
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
