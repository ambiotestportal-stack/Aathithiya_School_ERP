"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Search, User, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

import { StudentModal } from '@/components/organisms/StudentModal';
import { Eye } from 'lucide-react';

export default function TeacherStudentsPage() {
  const { user } = useAuthStore();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const [classesRes, staffRes] = await Promise.all([
          api.get('/api/academic/classes'),
          api.get('/api/staff')
        ]);
        
        const myProfile = staffRes.data.find((s: any) => s.user?._id === user?.id || s.user === user?.id);
        const assignedClassIds = myProfile?.assignedClasses?.map((c: any) => c._id || c) || [];

        const myClasses = classesRes.data.filter((c: any) => 
          c.classTeacher?._id === user?.id || 
          c.classTeacher === user?.id ||
          assignedClassIds.includes(c._id)
        );
        const myClassIds = myClasses.map((c: any) => c._id);
        
        if (myClassIds.length > 0) {
          const studentsRes = await api.get('/api/students');
          const myStudents = studentsRes.data.filter((s: any) => myClassIds.includes(s.enrolledClass?._id));
          setStudents(myStudents);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchStudents();
  }, [user]);

  const filtered = students.filter(s => 
    (s.user?.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (s.admissionNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleViewDetails = (student: any) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Students</h1>
        <p className="text-slate-500 mt-1">View profiles of students in your assigned classes.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by student name or admission number..." 
          className="flex-1 outline-none text-slate-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading student profiles...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            No students found in your assigned classes.
          </div>
        ) : (
          filtered.map((s, i) => (
            <motion.div key={s._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{s.user?.name || 'Student'}</h3>
                  <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded mt-1">
                    {s.admissionNumber || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="p-5 bg-slate-50 flex-1 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 font-medium">Class</span>
                  <span className="text-sm font-bold text-slate-800">{s.enrolledClass?.name} - {s.enrolledClass?.section}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 font-medium flex items-center gap-1"><Phone className="w-4 h-4"/> Parent Phone</span>
                  <span className="text-sm font-bold text-slate-800">{s.contactNumber || 'N/A'}</span>
                </div>
              </div>
              <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => handleViewDetails(s)}
                  className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" /> View Details
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <StudentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {}}
        mode="view"
        initialData={selectedStudent}
      />
    </div>
  );
}
