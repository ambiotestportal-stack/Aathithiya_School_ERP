"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/atoms/Button';
import { StudentModal } from '@/components/organisms/StudentModal';
import { ImportModal } from '@/components/organisms/ImportModal';
import { Plus, Trash2, GraduationCap, Search, Filter, Edit, Eye, Bus, Upload, FileSpreadsheet, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';
import { TableSkeleton } from '@/components/molecules/Skeletons';

export default function StudentManagementPage() {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const [search, setSearch] = useState('');
  
  // Filters
  const [filterBatch, setFilterBatch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');

  const { data: students = [], isLoading: loadingStudents, refetch: refetchStudents } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await api.get('/api/students');
      return res.data;
    }
  });

  const { data: batches = [] } = useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      const res = await api.get('/api/batches');
      return res.data;
    }
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const res = await api.get('/api/academic/classes');
      return res.data;
    }
  });

  const loading = loadingStudents;

  const fetchData = () => {
    refetchStudents();
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/students/${id}`);
      fetchData();
      toast.success('Student deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const handleOpenModal = (mode: 'add' | 'edit' | 'view', student: any = null) => {
    setModalMode(mode);
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const filteredStudents = students.filter((s: any) => {
    const matchesSearch = (s.user?.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (s.admissionNumber || '').toLowerCase().includes(search.toLowerCase()) ||
                          (s.rollNumber || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesBatch = filterBatch ? s.enrolledClass?.batch?._id === filterBatch : true;
    const matchesClass = filterClass ? s.enrolledClass?.name === filterClass : true;
    const matchesSection = filterSection ? s.enrolledClass?._id === filterSection : true;

    return matchesSearch && matchesBatch && matchesClass && matchesSection;
  });

  const getExportData = () => {
    const headers = [
      'Full Name', 'Admission No', 'Roll No', 'Batch', 'Class', 'Section', 
      'Gender', 'DOB', 'Transport', 'Bus No', 'Father Name', 'Phone No'
    ];

    const rows = filteredStudents.map((s: any) => [
      s.user?.name || '',
      s.admissionNumber || '',
      s.rollNumber || '',
      s.enrolledClass?.batch?.name || '',
      s.enrolledClass?.name || '',
      s.enrolledClass?.section || '',
      s.gender || '',
      s.dob ? new Date(s.dob).toLocaleDateString() : '',
      s.transportMode || 'Walk',
      s.busNumber || '',
      s.fatherName || '',
      s.contactNumber || ''
    ]);

    return { headers, rows };
  };

  const handleExportExcel = () => {
    const { headers, rows } = getExportData();
    exportToExcel('Student Directory', headers, rows);
  };

  const handleExportPDF = () => {
    const { headers, rows } = getExportData();
    exportToPDF(
      'Student Directory Report', 
      'Complete list of enrolled students, academic classes, and guardian details', 
      headers, 
      rows
    );
  };

  const availableClasses = classes.filter((c: any) => c.batch?._id === filterBatch);
  const uniqueClassNames = Array.from(new Set(availableClasses.map((c: any) => c.name)));
  const availableSections = availableClasses.filter((c: any) => c.name === filterClass);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Student Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage student profiles, enrollments, and guardian details.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button variant="secondary" onClick={handleExportExcel} className="flex items-center gap-1.5 text-xs py-2 px-3">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
          </Button>
          <Button variant="secondary" onClick={handleExportPDF} className="flex items-center gap-1.5 text-xs py-2 px-3">
            <FileText className="w-4 h-4 text-red-600" /> Export PDF
          </Button>
          <Button variant="secondary" onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-1.5 text-xs py-2 px-3">
            <Upload className="w-4 h-4 text-indigo-600" /> Import CSV
          </Button>
          <Button onClick={() => handleOpenModal('add')} className="text-xs py-2 px-3">
            <Plus className="w-4 h-4" /> Enroll Student
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by student name, roll number, or admission number..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none text-slate-900 dark:text-slate-100 transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Filter by Batch</label>
            <select 
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm outline-none"
              value={filterBatch}
              onChange={(e) => { setFilterBatch(e.target.value); setFilterClass(''); setFilterSection(''); }}
            >
              <option value="">All Batches</option>
              {batches.map((b: any) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Filter by Class</label>
            <select 
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm outline-none disabled:opacity-50"
              value={filterClass}
              onChange={(e) => { setFilterClass(e.target.value); setFilterSection(''); }}
              disabled={!filterBatch}
            >
              <option value="">All Classes</option>
              {uniqueClassNames.map(name => <option key={name as string} value={name as string}>{name as string}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Filter by Section</label>
            <select 
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm outline-none disabled:opacity-50"
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              disabled={!filterClass}
            >
              <option value="">All Sections</option>
              {availableSections.map((c: any) => <option key={c._id} value={c._id}>Section {c.section}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student Profile</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Class & Section</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transport</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Parent Details</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                      <p className="text-lg font-medium text-slate-900 dark:text-slate-100">No students found</p>
                    </div>
                  </td></tr>
                ) : (
                  filteredStudents.map((student: any, i: number) => (
                    <motion.tr key={student._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                            {student.user?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{student.user?.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Adm No: <span className="font-mono">{student.admissionNumber}</span></div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{student.enrolledClass?.name} - {student.enrolledClass?.section}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Roll No: {student.rollNumber} | Batch: {student.enrolledClass?.batch?.name}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Bus className="w-4 h-4 text-indigo-500" />
                          {student.transportMode || 'Walk'}
                        </div>
                        {student.transportMode === 'School Bus' && (
                          <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {student.busNumber ? `Bus No: ${student.busNumber}` : 'Bus Assigned'}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{student.fatherName || student.parent?.name || <span className="italic text-slate-400">Not Provided</span>}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{student.contactNumber}</div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button aria-label="View student details" onClick={() => handleOpenModal('view', student)} className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 p-2 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                          <button aria-label="Edit student" onClick={() => handleOpenModal('edit', student)} className="text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/50 p-2 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                          <button aria-label="Delete student" onClick={() => setDeleteConfirm({ open: true, id: student._id })} className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <StudentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData} 
        mode={modalMode}
        initialData={selectedStudent}
      />

      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onSuccess={fetchData} 
        type="student"
        classes={classes}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.open}
        title="Delete Student"
        message="Are you sure you want to delete this student and their login account? This action cannot be undone."
        onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  );
}
