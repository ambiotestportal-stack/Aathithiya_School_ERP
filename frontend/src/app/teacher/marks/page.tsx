"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { Save, FileText, Calculator, UserCheck, BookOpen, Download, FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function TeacherMarksPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'my_class' | 'classes_taught'>('my_class');

  const [exams, setExams] = useState<any[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teacherDepartment, setTeacherDepartment] = useState<string>('');

  // Selection states
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const [students, setStudents] = useState<any[]>([]);
  
  // Tab 1: Multi-Subject Grid state { [studentId]: { [subjectId]: marksObtained } }
  const [marksGrid, setMarksGrid] = useState<Record<string, Record<string, number | string>>>({});

  // Tab 2: Single Subject Marks state { [studentId]: { marksObtained: string, grade: string, remarks: string } }
  const [singleMarksData, setSingleMarksData] = useState<Record<string, { marksObtained: string, grade: string, remarks: string }>>({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const formatClassName = (c: any) => {
    if (!c) return '';
    const name = c.name || '';
    const section = c.section || '';
    if (name.toLowerCase().startsWith('class') || name.toLowerCase().startsWith('grade')) {
      return `${name} - Section ${section}`;
    }
    return `Class ${name} - Section ${section}`;
  };

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      api.get('/api/exams'),
      api.get('/api/academic/subjects'),
      api.get('/api/academic/classes'),
      api.get('/api/staff')
    ]).then(([examRes, subRes, classRes, staffRes]) => {
      setExams(examRes.data);
      setSubjects(subRes.data);
      setAllClasses(classRes.data);

      // Find staff profile for logged-in user
      const staffProf = staffRes.data.find((s: any) => s.user?._id === user?.id || s.user?.id === user?.id);
      if (staffProf) {
        if (staffProf.department) {
          setTeacherDepartment(staffProf.department);
          // Auto select teacher's subject if matching
          const matchSub = subRes.data.find((sub: any) => sub.name.toLowerCase() === staffProf.department.toLowerCase());
          if (matchSub) setSelectedSubject(matchSub._id);
        }
      }

      // Find classes where teacher is the Class Teacher
      const inChargeClasses = classRes.data.filter((c: any) => {
        const teacherId = c.classTeacher?._id || c.classTeacher;
        return teacherId === user?.id || (staffProf && teacherId === staffProf._id);
      });

      if (inChargeClasses.length > 0) {
        setMyClasses(inChargeClasses);
        setSelectedClass(inChargeClasses[0]._id);
      } else {
        // Fallback to all classes if no specific class teacher assignment exists
        setMyClasses(classRes.data);
        if (classRes.data.length > 0) setSelectedClass(classRes.data[0]._id);
      }
    }).catch(console.error);
  }, [user]);

  // Fetch Marks for Tab 1 (My Class - All Subjects)
  const fetchMyClassMarks = React.useCallback(async () => {
    if (!selectedExam || !selectedClass) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/exams/results?examId=${selectedExam}&classId=${selectedClass}`);
      setStudents(res.data.students || []);

      const newGridState: Record<string, Record<string, string>> = {};
      res.data.students.forEach((s: any) => { newGridState[s._id] = {}; });
      
      res.data.results.forEach((r: any) => {
        const studentId = r.student?._id || r.student;
        const subjectId = r.subject?._id || r.subject;
        if (studentId && subjectId && newGridState[studentId]) {
          newGridState[studentId][subjectId] = r.marksObtained;
        }
      });

      setMarksGrid(newGridState);
    } catch (error) {
      console.error('Failed to fetch my class marks', error);
    } finally {
      setLoading(false);
    }
  }, [selectedExam, selectedClass]);

  const fetchClassesTaughtMarks = React.useCallback(async () => {
    if (!selectedExam || !selectedClass || !selectedSubject) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/exams/results?examId=${selectedExam}&classId=${selectedClass}&subjectId=${selectedSubject}`);
      setStudents(res.data.students || []);

      const newSingleState: Record<string, { marksObtained: string, grade: string, remarks: string }> = {};
      res.data.students.forEach((s: any) => {
        newSingleState[s._id] = { marksObtained: '', grade: '', remarks: '' };
      });

      res.data.results.forEach((r: any) => {
        const studentId = r.student?._id || r.student;
        if (studentId && newSingleState[studentId]) {
          newSingleState[studentId] = {
            marksObtained: r.marksObtained === null ? '' : String(r.marksObtained),
            grade: r.grade || '',
            remarks: r.remarks || ''
          };
        }
      });

      setSingleMarksData(newSingleState);
    } catch (error) {
      console.error('Failed to fetch subject marks', error);
    } finally {
      setLoading(false);
    }
  }, [selectedExam, selectedClass, selectedSubject]);

  useEffect(() => {
    if (activeTab === 'my_class') {
      fetchMyClassMarks();
    } else {
      fetchClassesTaughtMarks();
    }
  }, [activeTab, fetchMyClassMarks, fetchClassesTaughtMarks]);

  // Tab 1: Cell Change
  const handleGridCellChange = (studentId: string, subjectId: string, value: string) => {
    setMarksGrid(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subjectId]: value
      }
    }));
  };

  // Tab 1: Calculate Total Marks
  const calculateTotal = (studentId: string) => {
    const studentMarks = marksGrid[studentId] || {};
    return Object.values(studentMarks).reduce<number>((sum, val) => {
      const num = Number(val);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  };

  // Tab 2: Single Subject Field Change
  const handleSingleFieldChange = (studentId: string, field: 'marksObtained' | 'grade' | 'remarks', value: string) => {
    setSingleMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { marksObtained: '', grade: '', remarks: '' }),
        [field]: value
      }
    }));
  };

  // Save Marks Tab 1 (All Subjects)
  const handleSaveMyClassMarks = async () => {
    if (!selectedExam) return toast.warning('Please select an exam.');
    setSaving(true);
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
        setSaving(false);
        return;
      }

      await api.post('/api/exams/results', {
        examId: selectedExam,
        records: recordsToSave
      });
      toast.success('All subject marks saved successfully for your class!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  // Save Marks Tab 2 (Single Subject)
  const handleSaveClassesTaughtMarks = async () => {
    if (!selectedExam || !selectedSubject) return toast.warning('Please select exam and subject.');
    setSaving(true);
    try {
      const recordsToSave: any[] = [];
      Object.entries(singleMarksData).forEach(([studentId, data]) => {
        recordsToSave.push({
          student: studentId,
          subject: selectedSubject,
          marksObtained: data.marksObtained === '' ? null : Number(data.marksObtained),
          totalMarks: 100,
          grade: data.grade,
          remarks: data.remarks
        });
      });

      if (recordsToSave.length === 0) {
        toast.warning('No subject marks entered to save.');
        setSaving(false);
        return;
      }

      await api.post('/api/exams/results', {
        examId: selectedExam,
        subjectId: selectedSubject,
        records: recordsToSave
      });
      toast.success('Subject marks saved successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save subject marks');
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    let csv = '';
    
    if (activeTab === 'my_class') {
      csv += 'Roll No,Student Name,' + subjects.map(s => `"${s.name}"`).join(',') + ',Total Marks\n';
      students.forEach(student => {
        const studentMarks = marksGrid[student._id] || {};
        const total = calculateTotal(student._id);
        const marks = subjects.map(s => studentMarks[s._id] ?? '0').join(',');
        csv += `"${student.rollNumber || 'N/A'}","${student.user?.name || ''}",${marks},${total}\n`;
      });
    } else {
      csv += 'Roll No,Student Name,Marks Obtained,Grade,Remarks\n';
      students.forEach(student => {
        const rowData = singleMarksData[student._id] || { marksObtained: '', grade: '', remarks: '' };
        csv += `"${student.rollNumber || 'N/A'}","${student.user?.name || ''}","${rowData.marksObtained}","${rowData.grade}","${rowData.remarks}"\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Marks_Export_${activeTab}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const tableId = activeTab === 'my_class' ? 'printable-my-class' : 'printable-classes-taught';
    const printContent = document.getElementById(tableId);
    if (!printContent) {
      toast.error('Nothing to print.');
      return;
    }
    
    const printWindow = window.open('', '', 'height=800,width=1000');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Marks Export</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        body { font-family: sans-serif; padding: 20px; }
        h2 { text-align: center; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
        th { background-color: #f8fafc; color: #333; }
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write(`<h2>Marks Report - ${activeTab === 'my_class' ? 'My Class' : 'Class Taught'}</h2>`);
      
      const clone = printContent.cloneNode(true) as HTMLElement;
      
      // Replace inputs with their text values for clean printing
      const inputs = clone.querySelectorAll('input');
      inputs.forEach(input => {
        const textNode = document.createTextNode(input.value || '-');
        input.parentNode?.replaceChild(textNode, input);
      });

      printWindow.document.write(clone.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      // small timeout to ensure styles load
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const activeClassList = activeTab === 'my_class' ? myClasses : allClasses;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Enter Marks</h1>
        <p className="text-slate-500 mt-1">Manage exam marks for your assigned class and subjects taught.</p>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('my_class')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'my_class' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserCheck className="w-4 h-4" /> 1) My Class (Class Teacher)
        </button>
        <button
          onClick={() => setActiveTab('classes_taught')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'classes_taught' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" /> 2) Class Taught (Subject Teacher)
        </button>
      </div>

      {/* Filter Options */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className={`grid grid-cols-1 ${activeTab === 'classes_taught' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Exam</label>
            <select 
              className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 outline-none font-medium" 
              value={selectedExam} 
              onChange={e => setSelectedExam(e.target.value)}
            >
              <option value="">-- Choose Exam --</option>
              {exams.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {activeTab === 'my_class' ? 'Select My Class (In-Charge)' : 'Select Class Taught'}
            </label>
            <select 
              className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 outline-none font-medium" 
              value={selectedClass} 
              onChange={e => setSelectedClass(e.target.value)}
            >
              <option value="">-- Choose Class --</option>
              {activeClassList.map(c => (
                <option key={c._id} value={c._id}>
                  {formatClassName(c)}
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'classes_taught' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Taught Subject</label>
              <select 
                className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 outline-none font-medium text-indigo-700" 
                value={selectedSubject} 
                onChange={e => setSelectedSubject(e.target.value)}
              >
                <option value="">-- Choose Subject --</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: MY CLASS (ALL SUBJECTS SPREADSHEET TABLE) */}
      {activeTab === 'my_class' && selectedExam && selectedClass && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-indigo-600"/> My Class - All Subjects Marks Table
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Enter marks for all subjects for your assigned class. Total marks are automatically calculated in real time.</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportCSV} variant="ghost" className="flex items-center gap-2 py-2 px-4 border border-slate-200">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
              </Button>
              <Button onClick={handleExportPDF} variant="ghost" className="flex items-center gap-2 py-2 px-4 border border-slate-200">
                <Download className="w-4 h-4 text-rose-600" /> Export PDF
              </Button>
              <Button onClick={handleSaveMyClassMarks} disabled={saving || students.length === 0} className="flex items-center gap-2 py-2 px-5 ml-2">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All Marks'}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto bg-white" id="printable-my-class">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Roll No</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider min-w-[160px]">Student Name</th>
                  {subjects.map(s => (
                    <th key={s._id} className="px-4 py-3.5 text-center text-xs font-bold text-indigo-700 bg-indigo-50/60 uppercase tracking-wider min-w-[120px]">
                      {s.name}
                    </th>
                  ))}
                  <th className="px-4 py-3.5 text-center text-xs font-bold text-emerald-800 bg-emerald-100/60 uppercase tracking-wider min-w-[100px]">
                    Total Marks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr><td colSpan={subjects.length + 3} className="p-8 text-center text-slate-500">Loading class students...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan={subjects.length + 3} className="p-8 text-center text-slate-500">No students enrolled in this class.</td></tr>
                ) : (
                  students.map(student => {
                    const studentMarks = marksGrid[student._id] || {};
                    const total = calculateTotal(student._id);

                    return (
                      <tr key={student._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono font-bold text-slate-600">{student.rollNumber || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm font-bold text-slate-900">{student.user?.name}</td>
                        {subjects.map(s => (
                          <td key={s._id} className="px-3 py-2 text-center bg-indigo-50/10">
                            <input 
                              type="number" 
                              className="w-20 px-2 py-1.5 border border-slate-200 rounded-xl text-center font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                              value={studentMarks[s._id] ?? ''} 
                              onChange={e => handleGridCellChange(student._id, s._id, e.target.value)}
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* TAB 2: CLASS TAUGHT (SINGLE SUBJECT ENTRY) */}
      {activeTab === 'classes_taught' && selectedExam && selectedClass && selectedSubject && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-indigo-600"/> Subject Marks Entry Form
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Enter marks specifically for your taught subject.</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportCSV} variant="ghost" className="flex items-center gap-2 py-2 px-4 border border-slate-200">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
              </Button>
              <Button onClick={handleExportPDF} variant="ghost" className="flex items-center gap-2 py-2 px-4 border border-slate-200">
                <Download className="w-4 h-4 text-rose-600" /> Export PDF
              </Button>
              <Button onClick={handleSaveClassesTaughtMarks} disabled={saving || students.length === 0} className="flex items-center gap-2 py-2 px-5 ml-2">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Subject Marks'}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto bg-white" id="printable-classes-taught">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Roll No</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Student Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 bg-indigo-50/50 uppercase">Marks Obtained</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Grade (Opt)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Remarks (Opt)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading class students...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">No students enrolled in this class.</td></tr>
                ) : (
                  students.map(student => {
                    const rowData = singleMarksData[student._id] || { marksObtained: '', grade: '', remarks: '' };

                    return (
                      <tr key={student._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-600">{student.rollNumber || 'N/A'}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{student.user?.name}</td>
                        <td className="px-6 py-4 bg-indigo-50/20">
                          <input 
                            type="number" 
                            className="w-28 px-3 py-2 border rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" 
                            value={rowData.marksObtained}
                            onChange={e => handleSingleFieldChange(student._id, 'marksObtained', e.target.value)}
                            placeholder="0"
                            min={0}
                            max={100}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            type="text" 
                            className="w-20 px-3 py-2 border rounded-xl font-bold uppercase outline-none focus:ring-2 focus:ring-indigo-500" 
                            value={rowData.grade}
                            onChange={e => handleSingleFieldChange(student._id, 'grade', e.target.value)}
                            placeholder="A"
                            maxLength={2}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" 
                            value={rowData.remarks}
                            onChange={e => handleSingleFieldChange(student._id, 'remarks', e.target.value)}
                            placeholder="Good effort..."
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
