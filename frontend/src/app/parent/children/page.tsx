"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Users, GraduationCap, MapPin, User, Calendar, Droplets } from 'lucide-react';

export default function ParentChildrenPage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      api.get(`/api/students/children?parentId=${user.id}`)
        .then(res => setChildren(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Children</h1>
        <p className="text-slate-500 mt-1">View the academic profiles of your enrolled children.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading children profiles...</div>
        ) : children.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-800">No Children Linked</p>
            <p className="text-slate-500">Please contact administration to link your child's profile to your account.</p>
          </div>
        ) : (
          children.map((child, i) => (
            <motion.div 
              key={child._id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative group"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{child.user?.name}</h3>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold">
                      <GraduationCap className="w-4 h-4" />
                      Class {child.enrolledClass?.name} - {child.enrolledClass?.section}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Roll Number</p>
                    <p className="font-mono text-slate-700 font-medium">{child.rollNumber}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Admission No</p>
                    <p className="font-mono text-slate-700 font-medium">{child.admissionNumber}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-rose-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blood Group</p>
                      <p className="text-slate-700 font-medium">{child.bloodGroup || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date of Birth</p>
                      <p className="text-slate-700 font-medium">{child.dob ? new Date(child.dob).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {child.address && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Address</p>
                      <p className="text-slate-700 text-sm mt-0.5 leading-relaxed">{child.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
