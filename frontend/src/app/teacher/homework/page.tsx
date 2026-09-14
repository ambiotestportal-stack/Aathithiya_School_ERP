"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Plus, Trash2, BookOpen, Clock, FileText, X, Eye, User, Calendar } from 'lucide-react';

const HomeworkDetailsModal = ({ isOpen, onClose, hw }: { isOpen: boolean; onClose: () => void; hw: any }) => {
  if (!isOpen || !hw) return null;

  const isOverdue = new Date(hw.dueDate) < new Date() && new Date(hw.dueDate).toDateString() !== new Date().toDateString();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative z-10 overflow-hidden flex flex-col">
          
          <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50/80">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                {hw.subject?.name || 'Subject'}
              </span>
              <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold">
                Class {hw.enrolledClass?.name} - {hw.enrolledClass?.section}
              </span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">{hw.title}</h2>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-indigo-500" /> Assigned by: <strong className="text-slate-700">{hw.assignedBy?.name || 'Teacher'}</strong></span>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Instructions & Details</h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {hw.description}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Assigned Date</div>
                  <div className="text-xs font-bold text-slate-800">{new Date(hw.createdAt || Date.now()).toLocaleDateString()}</div>
                </div>
              </div>

              <div className={`p-3 rounded-xl border flex items-center gap-3 ${isOverdue ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                <Clock className={`w-5 h-5 shrink-0 ${isOverdue ? 'text-red-500' : 'text-amber-500'}`} />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Submission Due</div>
                  <div className={`text-xs font-bold ${isOverdue ? 'text-red-600' : 'text-amber-700'}`}>
                    {new Date(hw.dueDate).toLocaleDateString()} {isOverdue && '(Overdue)'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t bg-slate-50/50 flex justify-end">
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const HomeworkModal = ({ isOpen, onClose, onSuccess, classes, subjects }: any) => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({ title: '', description: '', enrolledClass: '', subject: '', dueDate: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/homework', { ...formData, assignedBy: user?.id });
      onSuccess();
      onClose();
      setFormData({ title: '', description: '', enrolledClass: '', subject: '', dueDate: '' });
    } catch (err) {
      alert('Failed to assign homework');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative z-10 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold">Assign Homework</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-6">
              <form id="hw-form" onSubmit={handleSubmit} className="space-y-4">
                <Input label="Task Title" id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="e.g. Chapter 3 Exercises" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Class</label>
                    <select value={formData.enrolledClass} onChange={e => setFormData({...formData, enrolledClass: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 outline-none" required>
                      <option value="">-- Select Class --</option>
                      {classes.map((c: any) => <option key={c._id} value={c._id}>Class {c.name} - {c.section}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Subject</label>
                    <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 outline-none" required>
                      <option value="">-- Select Subject --</option>
                      {subjects.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <Input label="Due Date" id="dueDate" type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} required />
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">Instructions</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="w-full px-4 py-3 rounded-xl border bg-gray-50 outline-none" rows={4} placeholder="Describe the homework..."></textarea>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50/50 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button form="hw-form" type="submit" disabled={loading}>{loading ? 'Assigning...' : 'Assign Task'}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function TeacherHomeworkPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHwDetails, setSelectedHwDetails] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      router.push('/student/homework');
    }
  }, [user, router]);

  const fetchHomeworks = async () => {
    setLoading(true);
    try {
      const [hwRes, classRes, subRes, staffRes] = await Promise.all([
        api.get('/api/homework'),
        api.get('/api/academic/classes'),
        api.get('/api/academic/subjects'),
        api.get('/api/staff')
      ]);
      
      const myHw = hwRes.data.filter((h: any) => h.assignedBy?._id === user?.id || h.assignedBy === user?.id);
      setHomeworks(myHw);
      
      const myStaffProfile = staffRes.data.find((s: any) => s.user?._id === user?.id || s.user === user?.id);
      const assignedClassIds = (myStaffProfile?.assignedClasses || []).map((c: any) => c._id || c);

      const myClasses = classRes.data.filter((c: any) => 
        c.classTeacher?._id === user?.id || 
        c.classTeacher === user?.id ||
        assignedClassIds.includes(c._id)
      );

      setClasses(myClasses.length > 0 ? myClasses : classRes.data);
      setSubjects(subRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchHomeworks();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this homework assignment?')) {
      await api.delete(`/api/homework/${id}`);
      fetchHomeworks();
    }
  };

  const handleOpenDetails = (hw: any) => {
    setSelectedHwDetails(hw);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Homework Assignments</h1>
          <p className="text-slate-500 mt-1">Assign and manage daily tasks for your classes.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-5 h-5" /> Assign Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading assignments...</div>
        ) : homeworks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p>You haven't assigned any homework yet.</p>
          </div>
        ) : (
          homeworks.map((hw, i) => (
            <motion.div key={hw._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden flex flex-col group relative">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
              <div className="p-5 flex-1 cursor-pointer" onClick={() => handleOpenDetails(hw)}>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                    {hw.subject?.name}
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(hw._id); }} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{hw.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">{hw.description}</p>
                
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-auto pt-4 border-t border-slate-100">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="font-medium">Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Class {hw.enrolledClass?.name} - {hw.enrolledClass?.section}</span>
                <button 
                  onClick={() => handleOpenDetails(hw)}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> View Details
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <HomeworkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchHomeworks} classes={classes} subjects={subjects} />
      
      <HomeworkDetailsModal 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        hw={selectedHwDetails} 
      />
    </div>
  );
}
