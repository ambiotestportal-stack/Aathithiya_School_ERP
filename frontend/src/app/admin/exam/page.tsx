"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { ExamModal } from '@/components/organisms/ExamModal';
import { Plus, Trash2, Edit, Save, FileText, Calendar, ChevronDown, ChevronUp, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';

export default function ExaminationPage() {
  const [activeTab, setActiveTab] = useState<'exams' | 'marks'>('exams');
  
  // Exams Tab State
  const [exams, setExams] = useState<any[]>([]);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examModalMode, setExamModalMode] = useState<'create' | 'edit'>('create');
  const [selectedExamForModal, setSelectedExamForModal] = useState<any>(null);
  const [loadingExams, setLoadingExams] = useState(true);
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);

  // Marks Tab State
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  
  const [students, setStudents] = useState<any[]>([]);
  const [marksGrid, setMarksGrid] = useState<Record<string, Record<string, number | string>>>({});
  
  const [loadingMarks, setLoadingMarks] = useState(false);
  const [savingMarks, setSavingMarks] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const fetchExams = async () => {
    setLoadingExams(true);
    try {
      const res = await api.get('/api/exams');
      setExams(res.data);
    } catch (error) {
      console.error('Failed to fetch exams', error);
      toast.error('Failed to fetch exams');
    } finally {
      setLoadingExams(false);
    }
  };

  useEffect(() => {
    fetchExams();
    api.get('/api/academic/classes').then(res => setClasses(res.data)).catch(console.error);
    api.get('/api/academic/subjects').then(res => setSubjects(res.data)).catch(console.error);
  }, []);

  const handleOpenCreateExam = () => {
    setExamModalMode('create');
    setSelectedExamForModal(null);
    setIsExamModalOpen(true);
  };

  const handleOpenEditExam = (exam: any) => {
    setExamModalMode('edit');
    setSelectedExamForModal(exam);
    setIsExamModalOpen(true);
  };

  const handleDeleteExam = async (id: string) => {
    try {
      await api.delete(`/api/exams/${id}`);
      fetchExams();
      toast.success('Exam deleted successfully');
    } catch (error) {
      toast.error('Failed to delete exam');
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const fetchMarks = async () => {
    if (!selectedExam || !selectedClass) return;
    setLoadingMarks(true);
    try {
      const res = await api.get(`/api/exams/results?examId=${selectedExam}&classId=${selectedClass}`);
      setStudents(res.data.students);
      
      const newGridState: Record<string, Record<string, number | string>> = {};
      res.data.students.forEach((s: any) => {
        newGridState[s._id] = {};
      });

      res.data.results.forEach((r: any) => {
        const studentId = r.student?._id || r.student;
        const subjectId = r.subject?._id || r.subject;
        if (studentId && subjectId && newGridState[studentId]) {
          newGridState[studentId][subjectId] = r.marksObtained;
        }
      });

      setMarksGrid(newGridState);
    } catch (error) {
      console.error('Failed to fetch marks', error);
      toast.error('Failed to fetch marks');
    } finally {
      setLoadingMarks(false);
    }
  };

  useEffect(() => {
    fetchMarks();
  }, [selectedExam, selectedClass]);

  const handleCellChange = (studentId: string, subjectId: string, value: string) => {
    setMarksGrid(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subjectId]: value
      }
    }));
  };

  const calculateTotal = (studentId: string) => {
    const studentMarks = marksGrid[studentId] || {};
    return Object.values(studentMarks).reduce<number>((sum, val) => {
      const num = Number(val);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  };

  const handleSaveMarks = async () => {
    if (!selectedExam) {
      toast.warning('Please select an exam.');
      return;
    }

    setSavingMarks(true);
    try {
      const recordsToSave: any[] = [];

      Object.entries(marksGrid).forEach(([studentId, subjectMap]) => {
        Object.entries(subjectMap).forEach(([subjectId, value]) => {
          if (value !== undefined) {
            recordsToSave.push({
              student: studentId,
              subject: subjectId,
              marksObtained: value === '' ? null : Number(value),
              totalMarks: 100
            });
          }
        });
      });

      if (recordsToSave.length === 0) {
        toast.warning('No marks entered to save.');
        setSavingMarks(false);
        return;
      }

      await api.post('/api/exams/results', {
        examId: selectedExam,
        records: recordsToSave
      });

      toast.success('All subject marks saved successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save marks');
    } finally {
      setSavingMarks(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedExamId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Examination Module</h1>
          <p className="text-slate-500 mt-1">Manage multiple exams, timetables, and student marks.</p>
        </div>
        {activeTab === 'exams' && (
          <Button onClick={handleOpenCreateExam} className="w-full sm:w-auto">
            <Plus className="w-5 h-5" /> Create Exam
          </Button>
        )}
      </div>

      <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-full max-w-md">
        <button onClick={() => setActiveTab('exams')} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'exams' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          Manage Exams
        </button>
        <button onClick={() => setActiveTab('marks')} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'marks' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          Enter Marks Table
        </button>
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        {activeTab === 'exams' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Exam Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Timeline</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Timetable</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loadingExams ? <tr><td colSpan={5} className="p-6 text-center text-slate-500">Loading exams...</td></tr> : 
                 exams.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-slate-500">No exams created yet.</td></tr> :
                 exams.map((exam) => (
                  <React.Fragment key={exam._id}>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{exam.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{exam.enrolledClasses.length} Classes Enrolled</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div>{new Date(exam.startDate).toLocaleDateString()} to</div>
                        <div>{new Date(exam.endDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        {exam.schedule && exam.schedule.length > 0 ? (
                          <button 
                            onClick={() => toggleExpand(exam._id)} 
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            {exam.schedule.length} Subjects
                            {expandedExamId === exam._id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No timetable</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          exam.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                          exam.status === 'Ongoing' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {exam.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenEditExam(exam)} title="Edit Exam" className="text-slate-400 hover:text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteConfirm({ open: true, id: exam._id })} title="Delete Exam" className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                    {expandedExamId === exam._id && exam.schedule && (
                      <tr className="bg-slate-50/70">
                        <td colSpan={5} className="px-8 py-3">
                          <div className="bg-white p-3 rounded-xl border space-y-2">
                            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Exam Timetable</div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {exam.schedule.map((item: any, sIdx: number) => (
                                <div key={sIdx} className="bg-slate-50 p-2 rounded-lg border text-xs flex justify-between items-center">
                                  <span className="font-bold text-slate-800">{item.subject?.name || 'Subject'}</span>
                                  <span className="text-slate-500 font-mono">{new Date(item.date).toLocaleDateString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Exam</label>
                <select className="w-full px-4 py-2 rounded-xl border bg-slate-50 outline-none font-medium" value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
                  <option value="">-- Choose Exam --</option>
                  {exams.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Class</label>
                <select className="w-full px-4 py-2 rounded-xl border bg-slate-50 outline-none font-medium" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                  <option value="">-- Choose Class --</option>
                  {classes.map(c => <option key={c._id} value={c._id}>Class {c.name} - Sec {c.section}</option>)}
                </select>
              </div>
            </div>

            {selectedExam && selectedClass && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2"><FileText className="w-4 h-4"/> Multi-Subject Marks Entry Table</h4>
                  <Button onClick={handleSaveMarks} disabled={savingMarks || students.length === 0} className="flex items-center gap-2 text-sm py-1.5 px-3">
                    <Save className="w-4 h-4" /> {savingMarks ? 'Saving...' : 'Save All Marks'}
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Roll No</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Student Name</th>
                        {subjects.map(s => (
                          <th key={s._id} className="px-4 py-3 text-center text-xs font-bold text-indigo-700 uppercase min-w-[110px]">
                            {s.name}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-center text-xs font-bold text-emerald-800 bg-emerald-100/60 uppercase">
                          Total Marks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {loadingMarks ? <tr><td colSpan={subjects.length + 3} className="p-4 text-center text-slate-500">Loading students...</td></tr> :
                       students.length === 0 ? <tr><td colSpan={subjects.length + 3} className="p-4 text-center text-slate-500">No students found.</td></tr> :
                       students.map(student => {
                        const studentMarks = marksGrid[student._id] || {};
                        const total = calculateTotal(student._id);

                        return (
                          <tr key={student._id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-mono font-bold text-slate-700">{student.rollNumber || 'N/A'}</td>
                            <td className="px-4 py-3 font-bold text-slate-800">{student.user?.name}</td>
                            {subjects.map(s => (
                              <td key={s._id} className="px-3 py-2 text-center">
                                <input 
                                  type="number" 
                                  className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-center font-bold outline-none focus:ring-2 focus:ring-indigo-500" 
                                  value={studentMarks[s._id] ?? ''} 
                                  onChange={e => handleCellChange(student._id, s._id, e.target.value)} 
                                  placeholder="0"
                                  min={0}
                                  max={100}
                                />
                              </td>
                            ))}
                            <td className="px-4 py-3 text-center bg-emerald-50/30">
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl font-black text-sm border border-emerald-200">
                                <Calculator className="w-3.5 h-3.5 text-emerald-600" /> {total}
                              </span>
                            </td>
                          </tr>
                        );
                       })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      <ExamModal 
        isOpen={isExamModalOpen} 
        onClose={() => setIsExamModalOpen(false)} 
        onSuccess={fetchExams}
        mode={examModalMode}
        initialData={selectedExamForModal}
      />
      
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        title="Delete Exam"
        message="Are you sure? This will delete the exam and ALL associated marks. This action cannot be undone."
        onConfirm={() => deleteConfirm.id && handleDeleteExam(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  );
}
