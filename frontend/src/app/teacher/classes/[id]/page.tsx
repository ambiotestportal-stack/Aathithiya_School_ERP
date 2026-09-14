"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { ArrowLeft, Users, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClassDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        // Fetch the specific class
        const classRes = await api.get(`/api/academic/classes`);
        const foundClass = classRes.data.find((c: any) => c._id === id);
        setClassData(foundClass);

        // Fetch students
        const studentsRes = await api.get('/api/students');
        const studentsInClass = studentsRes.data.filter((s: any) => s.enrolledClass?._id === id);
        setStudents(studentsInClass);
      } catch (error) {
        console.error('Failed to fetch class details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return <div className="py-12 text-center text-slate-500">Loading class details...</div>;
  }

  if (!classData) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-bold text-slate-700">Class not found</h2>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Class {classData.name} - Section {classData.section}
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <Users className="w-4 h-4" /> {students.length} Students Enrolled
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Roll No</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No students are currently enrolled in this class.
                  </td>
                </tr>
              ) : (
                students.map((student, i) => (
                  <motion.tr 
                    key={student._id} 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-slate-600 font-medium">
                      {student.rollNumber || '-'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <User className="w-4 h-4" />
                      </div>
                      {student.user?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {student.gender || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 text-right font-medium">
                      {student.contactNumber || '-'}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
