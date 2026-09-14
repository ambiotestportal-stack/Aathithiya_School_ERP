"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Bus, MapPin, Phone, Users } from 'lucide-react';

export default function ParentTransportPage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<any[]>([]);
  const [transportData, setTransportData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const childrenRes = await api.get(`/api/students/children?parentId=${user?.id}`);
        const myChildren = childrenRes.data;
        setChildren(myChildren);
        
        const transportRes = await api.get('/api/transport');
        const allBuses = transportRes.data;
        
        const data: Record<string, any> = {};
        for (const child of myChildren) {
          // Find the bus that has this child in its students array
          const assignedBus = allBuses.find((b: any) => 
            b.students.some((s: any) => (typeof s === 'string' ? s === child._id : s._id === child._id))
          );
          if (assignedBus) data[child._id] = assignedBus;
        }
        setTransportData(data);
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
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Transport Details</h1>
        <p className="text-slate-500 mt-1">View bus allocation and driver contact info for your children.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading transport info...</div>
      ) : children.length === 0 ? (
        <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">No children linked to your account.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child, i) => {
            const bus = transportData[child._id];
            
            return (
              <motion.div key={child._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-50 border-b flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {child.user?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{child.user?.name || 'Child'}</h3>
                    <p className="text-xs text-slate-500">Class {child.enrolledClass?.name || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="p-6 flex-1">
                  {!bus ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 py-6">
                      <Bus className="w-8 h-8 mb-2 opacity-50" />
                      <p>No school transport assigned.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex items-center gap-4">
                        <div className="bg-amber-100 text-amber-700 p-3 rounded-xl">
                          <Bus className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-500 uppercase">Vehicle Number</p>
                          <p className="text-xl font-black font-mono text-slate-900">{bus.vehicleNumber}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 pt-4 border-t border-slate-100">
                        <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase">Route</p>
                          <p className="font-medium text-slate-800">{bus.route}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase">Driver Info</p>
                          <p className="font-medium text-slate-800">{bus.driverName}</p>
                          <p className="text-sm text-slate-500">{bus.driverContact}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
