"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { TransportModal } from '@/components/organisms/TransportModal';
import { Plus, Trash2, Bus, MapPin, Users, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';

const AllocateStudentModal = ({ isOpen, onClose, onSuccess, vehicleId, students }: any) => {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/api/transport/${vehicleId}/allocate`, { studentId });
      toast.success('Student allocated successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to allocate student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl max-w-sm w-full relative z-10 overflow-hidden flex flex-col p-6">
            <h3 className="text-xl font-bold mb-4">Allocate Student</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full px-4 py-2 border rounded-xl" required>
                <option value="">Select Student...</option>
                {students.map((s: any) => <option key={s._id} value={s._id}>{s.user?.name} - {s.enrolledClass?.name}</option>)}
              </select>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Allocate'}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function TransportPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allocateModalOpen, setAllocateModalOpen] = useState<string | null>(null);

  const [deleteVehicleConfirm, setDeleteVehicleConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [removeStudentConfirm, setRemoveStudentConfirm] = useState<{ open: boolean; vehicleId: string | null; studentId: string | null }>({ open: false, vehicleId: null, studentId: null });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, sRes] = await Promise.all([
        api.get('/api/transport'),
        api.get('/api/students')
      ]);
      setVehicles(vRes.data);
      setStudents(sRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleRemoveStudent = async (vehicleId: string, studentId: string) => {
    try {
      await api.delete(`/api/transport/${vehicleId}/remove/${studentId}`);
      fetchData();
      toast.success('Student removed from route');
    } catch (error) {
      toast.error('Failed to remove student');
    } finally {
      setRemoveStudentConfirm({ open: false, vehicleId: null, studentId: null });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Transport Management</h1>
          <p className="text-slate-500 mt-1">Manage school buses, bus numbers, routes, drivers, and student allocations.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-5 h-5" /> Add Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 flex flex-col items-center">
            <Bus className="w-12 h-12 text-slate-300 mb-3" />
            <p>No vehicles added yet.</p>
          </div>
        ) : (
          vehicles.map((vehicle, i) => {
            const studentCount = vehicle.students?.length || 0;
            const occupancyPercentage = (vehicle.capacity || 0) > 0 ? (studentCount / vehicle.capacity) * 100 : 0;
            return (
              <motion.div 
                key={vehicle._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
              >
                <div className="bg-amber-400 p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {vehicle.busNumber && (
                      <div className="bg-amber-900 text-amber-100 font-bold px-3 py-1 rounded-lg text-xs tracking-wide">
                        BUS NO: {vehicle.busNumber}
                      </div>
                    )}
                    <div className="bg-white/20 backdrop-blur-sm text-amber-900 font-mono font-bold px-3 py-1 rounded-lg border border-amber-300/50 shadow-inner text-xs">
                      {vehicle.vehicleNumber}
                    </div>
                  </div>
                  <button onClick={() => setDeleteVehicleConfirm({ open: true, id: vehicle._id })} className="text-amber-900/50 hover:text-red-600 bg-white/0 hover:bg-white/20 p-2 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Route</p>
                      <p className="text-sm font-medium text-slate-800">{vehicle.route}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 py-4 my-4 border-y border-slate-100">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">Capacity</p>
                        <p className="text-sm font-medium text-slate-800">{vehicle.capacity} Seats</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">Driver</p>
                        <p className="text-sm font-medium text-slate-800">{vehicle.driverName}</p>
                        <p className="text-xs text-slate-500">{vehicle.driverContact}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-slate-800 text-sm">Allocated Students ({studentCount}/{vehicle.capacity})</h4>
                      <button onClick={() => setAllocateModalOpen(vehicle._id)} className="text-blue-500 text-sm font-medium hover:underline flex items-center gap-1">
                        <Plus className="w-4 h-4"/> Add
                      </button>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
                      <div className={`h-1.5 rounded-full ${occupancyPercentage >= 100 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}></div>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-2 max-h-32 overflow-y-auto">
                      {studentCount === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-2">No students allocated</p>
                      ) : (
                        <div className="space-y-1">
                          {vehicle.students.map((s: any) => (
                            <div key={s._id} className="flex justify-between items-center bg-white px-2 py-1 rounded text-xs shadow-sm border border-slate-100">
                              <span className="font-medium text-slate-700">{s.user?.name} <span className="text-slate-400">({s.enrolledClass?.name})</span></span>
                              <button onClick={() => setRemoveStudentConfirm({ open: true, vehicleId: vehicle._id, studentId: s._id })} className="text-red-400 hover:text-red-600">Remove</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <AllocateStudentModal 
                  isOpen={allocateModalOpen === vehicle._id} 
                  onClose={() => setAllocateModalOpen(null)} 
                  onSuccess={fetchData} 
                  vehicleId={vehicle._id} 
                  students={students} 
                />
              </motion.div>
            )
          })
        )}
      </div>

      <TransportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchData} />

      <ConfirmDialog
        isOpen={deleteVehicleConfirm.open}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle?"
        onConfirm={() => deleteVehicleConfirm.id && handleDelete(deleteVehicleConfirm.id)}
        onCancel={() => setDeleteVehicleConfirm({ open: false, id: null })}
      />

      <ConfirmDialog
        isOpen={removeStudentConfirm.open}
        title="Remove Student"
        message="Remove this student from the route?"
        onConfirm={() => removeStudentConfirm.vehicleId && removeStudentConfirm.studentId && handleRemoveStudent(removeStudentConfirm.vehicleId, removeStudentConfirm.studentId)}
        onCancel={() => setRemoveStudentConfirm({ open: false, vehicleId: null, studentId: null })}
      />
    </div>
  );
}
