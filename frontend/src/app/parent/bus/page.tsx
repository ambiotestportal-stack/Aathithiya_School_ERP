"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Bus, Map, Phone, User, Users } from 'lucide-react';

export default function ParentBusPage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<any[]>([]);
  const [transports, setTransports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const [childrenRes, transportRes] = await Promise.all([
          api.get(`/api/students/children?parentId=${user.id}`),
          api.get('/api/transport')
        ]);
        setChildren(childrenRes.data);
        setTransports(transportRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Map each child to their transport (if any)
  const childBusMap = children.map(child => {
    const route = transports.find(t => t.students.some((s: any) => (s._id || s) === child._id));
    return { child, route };
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Transport Details</h1>
        <p className="text-slate-500 mt-1">View the assigned bus routes and driver details for your children.</p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading transport details...</div>
        ) : childBusMap.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-800">No Children Linked</p>
          </div>
        ) : (
          childBusMap.map(({ child, route }, i) => (
            <motion.div 
              key={child._id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{child.user?.name}</h3>
                  <p className="text-xs text-slate-500">Class {child.enrolledClass?.name} - {child.enrolledClass?.section}</p>
                </div>
              </div>
              
              <div className="p-6">
                {route ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                        <Bus className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Vehicle Details</p>
                        <p className="text-xl font-bold text-slate-800 mt-1">{route.vehicleNumber}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                        <Map className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Assigned Route</p>
                        <p className="font-medium text-slate-700 mt-1">{route.route}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-10 h-10 bg-white shadow-sm border border-slate-200 text-slate-600 rounded-full flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-500">Driver: <span className="text-slate-800">{route.driverName}</span></p>
                        <p className="font-medium text-slate-700 mt-0.5">{route.driverContact}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bus className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="font-medium text-slate-700">No Transport Assigned</p>
                    <p className="text-sm text-slate-500 mt-1">This child is not currently assigned to any school bus route.</p>
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
