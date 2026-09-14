"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { ClassModal } from '@/components/organisms/ClassModal';
import { SubjectModal } from '@/components/organisms/SubjectModal';
import { BatchModal } from '@/components/organisms/BatchModal';
import { Plus, Trash2, BookOpen, Users, Calendar, Edit, UserCheck, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';

export default function AcademicManagementPage() {
  const [activeTab, setActiveTab] = useState<'batches' | 'classes' | 'subjects'>('batches');
  
  const [batches, setBatches] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  // Modal modes and selected items
  const [classModalMode, setClassModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedClass, setSelectedClass] = useState<any>(null);

  const [subjectModalMode, setSubjectModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  // Assign teacher state
  const [assigningClassId, setAssigningClassId] = useState<string | null>(null);
  const [assignTeacherValue, setAssignTeacherValue] = useState('');
  const [assignSaving, setAssignSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'batches') {
        const res = await api.get('/api/batches');
        setBatches(res.data);
      } else if (activeTab === 'classes') {
        const [clsRes, usersRes] = await Promise.all([
          api.get('/api/academic/classes'),
          api.get('/api/users')
        ]);
        setClasses(clsRes.data);
        setTeachers(usersRes.data.filter((u: any) => u.role === 'TEACHER'));
      } else {
        const res = await api.get('/api/academic/subjects');
        setSubjects(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleDelete = async (id: string, type: 'batches' | 'classes' | 'subjects') => {
    const endpoint = type === 'batches' ? `/api/batches/${id}` : `/api/academic/${type}/${id}`;
    if (confirm(`Are you sure you want to delete this item?`)) {
      try {
        await api.delete(endpoint);
        fetchData();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const handleAssignTeacher = async (classId: string) => {
    setAssignSaving(true);
    try {
      await api.put(`/api/academic/classes/${classId}`, {
        classTeacher: assignTeacherValue || null
      });
      setAssigningClassId(null);
      setAssignTeacherValue('');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to assign teacher');
    } finally {
      setAssignSaving(false);
    }
  };

  const startAssigning = (cls: any) => {
    setAssigningClassId(cls._id);
    setAssignTeacherValue(cls.classTeacher?._id || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Hierarchy</h1>
          <p className="text-slate-500 mt-1">Manage Batches, Classes, Sections, and Subjects.</p>
        </div>
        <Button 
          onClick={() => {
            if (activeTab === 'batches') setIsBatchModalOpen(true);
            else if (activeTab === 'classes') {
              setClassModalMode('add');
              setSelectedClass(null);
              setIsClassModalOpen(true);
            } else {
              setSubjectModalMode('add');
              setSelectedSubject(null);
              setIsSubjectModalOpen(true);
            }
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" /> Add {activeTab === 'batches' ? 'Batch' : activeTab === 'classes' ? 'Class/Section' : 'Subject'}
        </Button>
      </div>

      <div className="flex flex-wrap space-x-1 bg-slate-200/50 p-1 rounded-xl w-full max-w-2xl">
        <button
          onClick={() => setActiveTab('batches')}
          className={`flex-1 min-w-[120px] py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'batches' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Batches
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex-1 min-w-[120px] py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'classes' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Classes & Sections
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex-1 min-w-[120px] py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'subjects' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Subjects
        </button>
      </div>

      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/50">
              <tr>
                {activeTab === 'batches' ? (
                  <>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Batch Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Start Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">End Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                  </>
                ) : activeTab === 'classes' ? (
                  <>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Class Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Section</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Batch</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Capacity</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Class Teacher</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Subject Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Code</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Assigned Class</th>
                  </>
                )}
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
              ) : activeTab === 'batches' ? (
                batches.length === 0 ? <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No batches found.</td></tr> :
                batches.map((batch, i) => (
                  <motion.tr key={batch._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3"><Calendar className="text-slate-400 w-5 h-5"/>{batch.name}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{new Date(batch.startDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{new Date(batch.endDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${batch.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {batch.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(batch._id, 'batches')} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </motion.tr>
                ))
              ) : activeTab === 'classes' ? (
                classes.length === 0 ? <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No classes found.</td></tr> :
                classes.map((cls, i) => (
                  <motion.tr key={cls._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3"><Users className="text-slate-400 w-5 h-5"/>{cls.name}</td>
                    <td className="px-6 py-4"><span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-100">{cls.section}</span></td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{cls.batch ? cls.batch.name : <span className="text-slate-400 italic">No Batch</span>}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{cls.capacity} Students</td>
                    <td className="px-6 py-4">
                      {assigningClassId === cls._id ? (
                        <div className="flex items-center gap-2">
                          <select
                            className="px-3 py-2 rounded-lg border border-blue-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[160px]"
                            value={assignTeacherValue}
                            onChange={(e) => setAssignTeacherValue(e.target.value)}
                            autoFocus
                          >
                            <option value="">-- No Teacher --</option>
                            {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                          </select>
                          <Button onClick={() => handleAssignTeacher(cls._id)} disabled={assignSaving} className="text-xs px-3 py-1.5">
                            {assignSaving ? '...' : 'Save'}
                          </Button>
                          <button onClick={() => setAssigningClassId(null)} className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {cls.classTeacher ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-lg border border-emerald-100">
                              <UserCheck className="w-3.5 h-3.5" /> {cls.classTeacher.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-sm">Not Assigned</span>
                          )}
                          <button
                            onClick={() => startAssigning(cls)}
                            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                            title="Assign / Change Teacher"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setClassModalMode('view'); setSelectedClass(cls); setIsClassModalOpen(true); }} className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => { setClassModalMode('edit'); setSelectedClass(cls); setIsClassModalOpen(true); }} className="text-slate-400 hover:text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(cls._id, 'classes')} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                subjects.length === 0 ? <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No subjects found.</td></tr> :
                subjects.map((sub, i) => (
                  <motion.tr key={sub._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-900">{sub.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1">
                        {sub.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${sub.type === 'Theory' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {sub.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                      {sub.assignedClass ? (
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100 text-xs">
                          {sub.assignedClass.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-sm">All Classes</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setSubjectModalMode('view'); setSelectedSubject(sub); setIsSubjectModalOpen(true); }} className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => { setSubjectModalMode('edit'); setSelectedSubject(sub); setIsSubjectModalOpen(true); }} className="text-slate-400 hover:text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(sub._id, 'subjects')} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <BatchModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} onSuccess={fetchData} />
      <ClassModal 
        isOpen={isClassModalOpen} 
        onClose={() => setIsClassModalOpen(false)} 
        onSuccess={fetchData} 
        mode={classModalMode}
        initialData={selectedClass}
      />
      <SubjectModal 
        isOpen={isSubjectModalOpen} 
        onClose={() => setIsSubjectModalOpen(false)} 
        onSuccess={fetchData}
        mode={subjectModalMode}
        initialData={selectedSubject}
      />
    </div>
  );
}
