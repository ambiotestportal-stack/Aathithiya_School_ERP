"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Bus, Map, Phone, User, Users, Clock, CheckCircle2, Navigation, History, Info } from 'lucide-react';

const ChildTransportCard = ({ child, route, logs, index }: { child: any, route: any, logs: any[], index: number }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'log'>('details');

  // Filter logs for this specific route
  const assignedLogs = route 
    ? logs.filter(log => (log.transport?._id || log.transport) === route._id)
    : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{child.user?.name}</h3>
            <p className="text-xs text-slate-500">Class {child.enrolledClass?.name} - {child.enrolledClass?.section}</p>
          </div>
        </div>
        
        {route && (
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'details' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
            >
              <Info className="w-4 h-4" />
              Details
            </button>
            <button 
              onClick={() => setActiveTab('log')}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'log' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
            >
              <History className="w-4 h-4" />
              Bus Log
            </button>
          </div>
        )}
      </div>
      
      <div className="p-6">
        {!route ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bus className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-medium text-slate-700">No Transport Assigned</p>
            <p className="text-sm text-slate-500 mt-1">This child is not currently assigned to any school bus route.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'details' ? (
              <motion.div 
                key="details"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
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
              </motion.div>
            ) : (
              <motion.div 
                key="log"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              >
                {assignedLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="font-medium text-slate-700">No Logs Available</p>
                    <p className="text-sm text-slate-500 mt-1">There are no recent arrival or departure records for this bus.</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-indigo-100 ml-4 pl-8 py-2 space-y-8">
                    {assignedLogs.map((log: any, idx: number) => {
                      const isArrival = log.eventType === 'REACHED_SCHOOL';
                      return (
                        <div key={log._id || idx} className="relative">
                          {/* Timeline Dot */}
                          <div className={`absolute -left-[41px] w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center
                            ${isArrival ? 'bg-emerald-500' : 'bg-orange-500'}`} 
                          />
                          
                          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-sm relative">
                            {/* Connector Line Arrow */}
                            <div className="absolute top-5 -left-3 w-3 h-3 bg-slate-50 border-b border-l border-slate-100 transform rotate-45" />
                            
                            <div className="flex justify-between items-start">
                              <div className="flex gap-3 items-start">
                                {isArrival ? (
                                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                                ) : (
                                  <Navigation className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <h4 className="font-bold text-slate-800 text-lg">
                                    {isArrival ? 'Bus Reached School' : 'Bus Departed School'}
                                  </h4>
                                  <p className="text-slate-600 mt-1 text-sm">
                                    {isArrival 
                                      ? `The school bus safely arrived at the school campus.`
                                      : `The school bus has started its evening return trip.`}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right shrink-0 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                <p className="text-xs font-bold text-slate-500 uppercase">
                                  {new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                </p>
                                <p className="text-sm font-bold text-indigo-600">
                                  {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default function ParentBusPage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<any[]>([]);
  const [transports, setTransports] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const [childrenRes, transportRes, logsRes] = await Promise.all([
          api.get(`/api/students/children?parentId=${user.id}`),
          api.get('/api/transport'),
          api.get('/api/transport/logs')
        ]);
        setChildren(childrenRes.data);
        setTransports(transportRes.data);
        setLogs(logsRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

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
            <ChildTransportCard 
              key={child._id} 
              child={child} 
              route={route} 
              logs={logs} 
              index={i} 
            />
          ))
        )}
      </div>
    </div>
  );
}
