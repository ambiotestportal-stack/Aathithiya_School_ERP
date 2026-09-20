"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { TransportModal } from '@/components/organisms/TransportModal';
import { 
  Plus, Trash2, Bus, MapPin, Users, Phone, 
  Sun, Moon, CheckCircle2, History, Clock, Bell, Send, Search, X, UserMinus, UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';

// Dedicated Allocated Students Modal
const ManageBusStudentsModal = ({ 
  isOpen, 
  onClose, 
  vehicle, 
  allStudents, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  vehicle: any; 
  allStudents: any[]; 
  onSuccess: () => void;
}) => {
  const [search, setSearch] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  if (!vehicle) return null;

  const allocatedStudents = vehicle.students || [];

  const filteredAllocated = allocatedStudents.filter((s: any) => {
    const name = s.user?.name || '';
    const className = s.enrolledClass?.name || '';
    const roll = s.rollNumber || '';
    const query = search.toLowerCase();
    return name.toLowerCase().includes(query) || className.toLowerCase().includes(query) || roll.toLowerCase().includes(query);
  });

  const unallocatedStudents = allStudents.filter(
    (s: any) => !allocatedStudents.some((allocated: any) => (typeof allocated === 'string' ? allocated === s._id : allocated._id === s._id))
  );

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    setActionLoading(true);
    try {
      await api.post(`/api/transport/${vehicle._id}/allocate`, { studentId: selectedStudentId });
      toast.success('Student allocated to bus successfully');
      setSelectedStudentId('');
      setIsAddingStudent(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to allocate student');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (studentId: string) => {
    setActionLoading(true);
    try {
      await api.delete(`/api/transport/${vehicle._id}/remove/${studentId}`);
      toast.success('Student removed from bus');
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove student');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative z-10 overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {vehicle.busNumber && (
                    <span className="bg-amber-400 text-amber-950 font-bold px-2.5 py-0.5 rounded-lg text-xs">
                      BUS NO: {vehicle.busNumber}
                    </span>
                  )}
                  <span>Allocated Students ({allocatedStudents.length}/{vehicle.capacity})</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">Vehicle: {vehicle.vehicleNumber} • Route: {vehicle.route}</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Search & Add Bar */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search allocated students by name, class, roll no..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <Button onClick={() => setIsAddingStudent(!isAddingStudent)} size="sm">
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  {isAddingStudent ? 'Cancel' : 'Allocate Student'}
                </Button>
              </div>

              {/* Add Student Form */}
              <AnimatePresence>
                {isAddingStudent && (
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAllocate} 
                    className="bg-indigo-50/80 border border-indigo-200 p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-end"
                  >
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-indigo-950 mb-1">Select Student to Allocate</label>
                      <select
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-xl bg-white outline-none"
                        required
                      >
                        <option value="">-- Choose Student --</option>
                        {unallocatedStudents.map((s: any) => (
                          <option key={s._id} value={s._id}>
                            {s.user?.name} (Class {s.enrolledClass?.name || 'N/A'} - Roll: {s.rollNumber})
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button type="submit" disabled={actionLoading || !selectedStudentId} size="sm">
                      {actionLoading ? 'Saving...' : 'Confirm Allocation'}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Student List Table */}
              {filteredAllocated.length === 0 ? (
                <div className="py-12 text-center text-slate-400 border border-dashed rounded-xl">
                  {search ? 'No allocated students matching search query.' : 'No students allocated to this bus yet.'}
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase">
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">Class & Section</th>
                        <th className="py-3 px-4">Roll No</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAllocated.map((s: any) => (
                        <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {s.user?.name || 'Unknown Student'}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {s.enrolledClass?.name ? `Class ${s.enrolledClass.name}` : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                            {s.rollNumber || '-'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleRemove(s._id)}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              <UserMinus className="w-3.5 h-3.5" /> Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-slate-50 flex justify-end">
              <Button variant="secondary" onClick={onClose}>Close</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function TransportPage() {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'logs'>('vehicles');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Dedicated Manage Students Modal state
  const [manageStudentsVehicle, setManageStudentsVehicle] = useState<any | null>(null);

  const [notifyingBusId, setNotifyingBusId] = useState<string | null>(null);

  const [deleteVehicleConfirm, setDeleteVehicleConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, sRes, lRes] = await Promise.all([
        api.get('/api/transport'),
        api.get('/api/students'),
        api.get('/api/transport/logs')
      ]);
      setVehicles(vRes.data);
      setStudents(sRes.data);
      setLogs(lRes.data);

      // If a vehicle is currently selected in modal, update its state
      if (manageStudentsVehicle) {
        const updated = vRes.data.find((v: any) => v._id === manageStudentsVehicle._id);
        if (updated) setManageStudentsVehicle(updated);
      }
    } catch (error) {
      console.error('Failed to fetch transport data', error);
      toast.error('Failed to fetch transport data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await api.get('/api/transport/logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNotifyStatus = async (vehicleId: string, eventType: 'REACHED_SCHOOL' | 'STARTED_FROM_SCHOOL') => {
    setNotifyingBusId(`${vehicleId}-${eventType}`);
    try {
      await api.post(`/api/transport/${vehicleId}/notify-status`, { eventType });
      toast.success(
        eventType === 'REACHED_SCHOOL'
          ? 'Morning alert sent: Bus Reached School!'
          : 'Evening alert sent: Bus Departed School!'
      );
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setNotifyingBusId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/transport/${id}`);
      fetchData();
      toast.success('Vehicle deleted successfully');
    } catch (error) {
      toast.error('Failed to delete vehicle');
    } finally {
      setDeleteVehicleConfirm({ open: false, id: null });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header - Bus Icon Removed */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Transport Management
          </h1>
          <p className="text-slate-500 mt-1">Manage buses, student allocations, parent notifications & history logs.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto shadow-md">
          <Plus className="w-5 h-5" /> Add Vehicle
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'vehicles'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bus className="w-4 h-4" /> Buses & Allocations ({vehicles.length})
        </button>
        <button
          onClick={() => { setActiveTab('logs'); fetchLogs(); }}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" /> Daily History Logs ({logs.length})
        </button>
      </div>

      {/* TAB 1: Vehicles & Allocations */}
      {activeTab === 'vehicles' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-500">Loading vehicles...</div>
          ) : vehicles.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 flex flex-col items-center bg-white rounded-2xl p-8 border border-slate-200">
              <Bus className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-semibold text-slate-700">No vehicles added yet.</p>
              <p className="text-xs text-slate-400 mt-1">Click "Add Vehicle" to register a new school bus.</p>
            </div>
          ) : (
            vehicles.map((vehicle, i) => {
              const studentCount = vehicle.students?.length || 0;
              const occupancyPercentage = (vehicle.capacity || 0) > 0 ? (studentCount / vehicle.capacity) * 100 : 0;
              
              // Find latest log today for this vehicle
              const vehicleLogs = logs.filter((l: any) => 
                (typeof l.transport === 'string' ? l.transport === vehicle._id : l.transport?._id === vehicle._id)
              );
              const latestReachedLog = vehicleLogs.find((l: any) => l.eventType === 'REACHED_SCHOOL');
              const latestStartedLog = vehicleLogs.find((l: any) => l.eventType === 'STARTED_FROM_SCHOOL');

              return (
                <motion.div 
                  key={vehicle._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:border-indigo-300 transition-all cursor-pointer"
                  onClick={() => setManageStudentsVehicle(vehicle)}
                >
                  {/* Bus Card Header */}
                  <div className="bg-amber-400 p-4 flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {vehicle.busNumber && (
                        <div className="bg-amber-900 text-amber-100 font-bold px-3 py-1 rounded-lg text-xs tracking-wide shadow-sm">
                          BUS NO: {vehicle.busNumber}
                        </div>
                      )}
                      <div className="bg-white/30 backdrop-blur-sm text-amber-950 font-mono font-bold px-3 py-1 rounded-lg border border-amber-300 shadow-inner text-xs">
                        {vehicle.vehicleNumber}
                      </div>
                    </div>
                    <button 
                      onClick={() => setDeleteVehicleConfirm({ open: true, id: vehicle._id })} 
                      className="text-amber-900/60 hover:text-red-700 bg-white/0 hover:bg-white/20 p-2 rounded-lg transition-colors"
                      title="Delete Bus"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Bus Card Body */}
                  <div className="p-5 flex-1 flex flex-col space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Route</p>
                        <p className="text-sm font-semibold text-slate-800">{vehicle.route}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100 bg-slate-50/50 p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Capacity</p>
                          <p className="text-xs font-semibold text-slate-800">{vehicle.capacity} Seats</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Driver</p>
                          <p className="text-xs font-semibold text-slate-800">{vehicle.driverName}</p>
                          <p className="text-[10px] text-slate-500">{vehicle.driverContact}</p>
                        </div>
                      </div>
                    </div>

                    {/* Notification Trigger Controls */}
                    <div className="bg-indigo-50/60 border border-indigo-100 p-3.5 rounded-xl space-y-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                          <Bell className="w-4 h-4 text-indigo-600" /> Parent Notification Triggers
                        </span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                          {studentCount} Parents
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleNotifyStatus(vehicle._id, 'REACHED_SCHOOL')}
                          disabled={notifyingBusId === `${vehicle._id}-REACHED_SCHOOL`}
                          className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-xl shadow border border-emerald-500 transition-all disabled:opacity-50"
                        >
                          <Sun className="w-4 h-4" />
                          {notifyingBusId === `${vehicle._id}-REACHED_SCHOOL` ? 'Notifying...' : 'Bus Reached School'}
                        </button>
                        <button
                          onClick={() => handleNotifyStatus(vehicle._id, 'STARTED_FROM_SCHOOL')}
                          disabled={notifyingBusId === `${vehicle._id}-STARTED_FROM_SCHOOL`}
                          className="flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 px-3 rounded-xl shadow border border-amber-500 transition-all disabled:opacity-50"
                        >
                          <Moon className="w-4 h-4" />
                          {notifyingBusId === `${vehicle._id}-STARTED_FROM_SCHOOL` ? 'Notifying...' : 'Bus Departed School'}
                        </button>
                      </div>

                      {/* Status Badges */}
                      <div className="space-y-1 pt-1 text-[11px]">
                        {latestReachedLog ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Morning Arrival: {new Date(latestReachedLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(latestReachedLog.timestamp).toLocaleDateString()})</span>
                          </div>
                        ) : (
                          <div className="text-slate-400 italic">No morning arrival logged today</div>
                        )}
                        {latestStartedLog ? (
                          <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                            <Send className="w-3.5 h-3.5" />
                            <span>Evening Departure: {new Date(latestStartedLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(latestStartedLog.timestamp).toLocaleDateString()})</span>
                          </div>
                        ) : (
                          <div className="text-slate-400 italic">No evening departure logged today</div>
                        )}
                      </div>
                    </div>

                    {/* Dedicated Allocated Students Banner Click Button */}
                    <div className="mt-auto pt-2">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                        <div className={`h-1.5 rounded-full ${occupancyPercentage >= 100 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}></div>
                      </div>

                      <button
                        onClick={() => setManageStudentsVehicle(vehicle)}
                        className="w-full bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-800 hover:text-indigo-700 py-2.5 px-4 rounded-xl flex items-center justify-between font-bold text-xs transition-all shadow-sm group"
                      >
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                          View & Edit Allocated Students ({studentCount}/{vehicle.capacity})
                        </span>
                        <span className="text-indigo-600 group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: Daily History Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Transport Activity Logs</h2>
              <p className="text-xs text-slate-500">History of morning bus arrivals and evening departures triggered by admins.</p>
            </div>
            <Button variant="secondary" onClick={fetchLogs} disabled={logsLoading}>
              <History className="w-4 h-4 mr-2" /> Refresh Logs
            </Button>
          </div>

          {logsLoading ? (
            <div className="py-12 text-center text-slate-500">Loading history logs...</div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border border-dashed rounded-xl">
              No transport notification logs recorded yet. Click "Bus Reached School" or "Bus Departed School" on a vehicle to create a log entry.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase">
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Bus / Vehicle</th>
                    <th className="py-3 px-4">Route</th>
                    <th className="py-3 px-4">Event Status</th>
                    <th className="py-3 px-4">Triggered By</th>
                    <th className="py-3 px-4 text-center">Parents Notified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log: any) => (
                    <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {log.busNumber ? (
                          <span className="bg-amber-100 text-amber-800 font-bold text-xs px-2 py-0.5 rounded-md mr-1.5">
                            Bus {log.busNumber}
                          </span>
                        ) : null}
                        <span className="font-mono text-xs text-slate-600">{log.vehicleNumber}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{log.route}</td>
                      <td className="py-3 px-4">
                        {log.eventType === 'REACHED_SCHOOL' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold">
                            <Sun className="w-3.5 h-3.5 text-emerald-600" /> Reached School (Morning)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold">
                            <Moon className="w-3.5 h-3.5 text-amber-600" /> Departed School (Evening)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {log.triggeredBy?.name || 'Admin'}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-indigo-600">
                        {log.studentsNotifiedCount || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Dedicated Allocated Students Modal */}
      <ManageBusStudentsModal
        isOpen={!!manageStudentsVehicle}
        onClose={() => setManageStudentsVehicle(null)}
        vehicle={manageStudentsVehicle}
        allStudents={students}
        onSuccess={fetchData}
      />

      <TransportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchData} />

      <ConfirmDialog
        isOpen={deleteVehicleConfirm.open}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle?"
        onConfirm={() => deleteVehicleConfirm.id && handleDelete(deleteVehicleConfirm.id)}
        onCancel={() => setDeleteVehicleConfirm({ open: false, id: null })}
      />
    </div>
  );
}
