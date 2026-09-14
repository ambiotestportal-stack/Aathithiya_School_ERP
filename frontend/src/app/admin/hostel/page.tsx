"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { HostelModal } from '@/components/organisms/HostelModal';
import { Plus, Trash2, Home, Search, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';

const AllocateStudentModal = ({ isOpen, onClose, onSuccess, roomId, students }: any) => {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/api/hostels/${roomId}/allocate`, { studentId });
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
            <h3 className="text-xl font-bold mb-4">Allocate to Room</h3>
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

export default function HostelPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allocateModalOpen, setAllocateModalOpen] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [deleteRoomConfirm, setDeleteRoomConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [removeStudentConfirm, setRemoveStudentConfirm] = useState<{ open: boolean; roomId: string | null; studentId: string | null }>({ open: false, roomId: null, studentId: null });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRes, sRes] = await Promise.all([
        api.get('/api/hostels'),
        api.get('/api/students')
      ]);
      setRooms(rRes.data);
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
      await api.delete(`/api/hostels/${id}`);
      fetchData();
      toast.success('Room deleted successfully');
    } catch (error) {
      toast.error('Failed to delete room');
    } finally {
      setDeleteRoomConfirm({ open: false, id: null });
    }
  };

  const handleRemoveStudent = async (roomId: string, studentId: string) => {
    try {
      await api.delete(`/api/hostels/${roomId}/remove/${studentId}`);
      fetchData();
      toast.success('Student removed from room');
    } catch (error) {
      toast.error('Failed to remove student');
    } finally {
      setRemoveStudentConfirm({ open: false, roomId: null, studentId: null });
    }
  };

  const filteredRooms = rooms.filter(r => 
    (r.roomNumber || '').toLowerCase().includes(search.toLowerCase()) || 
    (r.blockName || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.wardenName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hostel Management</h1>
          <p className="text-slate-500 mt-1">Manage dormitories, rooms, and student occupancy.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-5 h-5" /> Add Room
        </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search rooms by number, block, or warden..." 
          className="flex-1 outline-none text-slate-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading rooms...</div>
        ) : filteredRooms.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 flex flex-col items-center">
            <Home className="w-12 h-12 text-slate-300 mb-3" />
            <p>No rooms found.</p>
          </div>
        ) : (
          filteredRooms.map((room, i) => {
            const occupancyPercentage = (room.currentOccupancy / room.capacity) * 100;
            return (
              <motion.div 
                key={room._id}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
              >
                <div className={`p-4 flex justify-between items-start ${room.roomType === 'Boys' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                  <div className="text-white">
                    <h3 className="text-xl font-bold font-mono">Room {room.roomNumber}</h3>
                    <p className="text-white/80 text-sm">{room.blockName} Block ({room.roomType})</p>
                  </div>
                  <button onClick={() => setDeleteRoomConfirm({ open: true, id: room._id })} className="text-white/50 hover:text-white bg-black/0 hover:bg-black/20 p-2 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-slate-400" />
                      <span className="text-sm font-bold text-slate-700">Occupancy</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900">
                      {room.currentOccupancy} <span className="text-sm text-slate-400">/ {room.capacity}</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full ${room.currentOccupancy >= room.capacity ? 'bg-red-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                    ></div>
                  </div>

                  <div className="pt-3 pb-4 mb-4 border-y border-slate-100">
                    <p className="text-xs text-slate-500 font-bold uppercase">Warden</p>
                    <p className="text-sm font-medium text-slate-800">{room.wardenName}</p>
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-slate-800 text-sm">Allocated Students</h4>
                      <button onClick={() => setAllocateModalOpen(room._id)} className="text-blue-500 text-xs font-medium hover:underline flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5"/> Add
                      </button>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-2 min-h-16 max-h-32 overflow-y-auto">
                      {room.students && room.students.length > 0 ? (
                        <div className="space-y-1">
                          {room.students.map((s: any) => (
                            <div key={s._id} className="flex justify-between items-center bg-white px-2 py-1 rounded text-xs shadow-sm border border-slate-100">
                              <span className="font-medium text-slate-700">{s.user?.name} <span className="text-slate-400">({s.enrolledClass?.name})</span></span>
                              <button onClick={() => setRemoveStudentConfirm({ open: true, roomId: room._id, studentId: s._id })} className="text-red-400 hover:text-red-600">Remove</button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-slate-400 py-2">
                          Room is empty
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <AllocateStudentModal 
                  isOpen={allocateModalOpen === room._id} 
                  onClose={() => setAllocateModalOpen(null)} 
                  onSuccess={fetchData} 
                  roomId={room._id} 
                  students={students} 
                />
              </motion.div>
            )
          })
        )}
      </div>

      <HostelModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchData} />

      <ConfirmDialog
        isOpen={deleteRoomConfirm.open}
        title="Delete Room"
        message="Are you sure you want to delete this room?"
        onConfirm={() => deleteRoomConfirm.id && handleDelete(deleteRoomConfirm.id)}
        onCancel={() => setDeleteRoomConfirm({ open: false, id: null })}
      />

      <ConfirmDialog
        isOpen={removeStudentConfirm.open}
        title="Remove Student"
        message="Remove this student from the room?"
        onConfirm={() => removeStudentConfirm.roomId && removeStudentConfirm.studentId && handleRemoveStudent(removeStudentConfirm.roomId, removeStudentConfirm.studentId)}
        onCancel={() => setRemoveStudentConfirm({ open: false, roomId: null, studentId: null })}
      />
    </div>
  );
}
