"use client";

import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import { X, Upload, FileText, Download, CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'student' | 'staff';
  classes?: any[];
}

export const ImportModal = ({ isOpen, onClose, onSuccess, type, classes = [] }: ImportModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; errors?: string[] } | null>(null);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    let csvContent = '';
    let filename = '';

    if (type === 'student') {
      csvContent = `Name,AdmissionNumber,RollNumber,ClassName,Section,DOB,Gender,FatherName,MotherName,ContactNumber,Address,TransportMode,BusNumber\n` +
                 `John Doe,ADM-2026-01,101,8,A,2010-08-15,Male,Robert Doe,Mary Doe,9876543210,123 School St,School Bus,33\n` +
                 `Jane Smith,ADM-2026-02,102,8,A,2011-03-22,Female,David Smith,Sarah Smith,9876543211,456 Park Ave,Walk,\n`;
      filename = 'sample_students_import.csv';
    } else {
      csvContent = `Name,Email,EmployeeID,Department,Designation,Qualification,ExperienceYears,Salary,Phone,Address\n` +
                 `Alice Johnson,alice@school.com,EMP-101,Mathematics,Senior Teacher,M.Sc B.Ed,5,45000,9876543222,789 Main Rd\n` +
                 `Bob Wilson,bob@school.com,EMP-102,English,Teacher,M.A B.Ed,3,40000,9876543223,321 Lake View\n`;
      filename = 'sample_staff_import.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });

    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const rows = parseCSV(content);
        setParsedData(rows);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedData.length === 0) return;

    setLoading(true);
    setResult(null);

    try {
      if (type === 'student') {
        // Map ClassName + Section to enrolledClass ID if classes available
        const preparedStudents = parsedData.map(row => {
          let enrolledClassId = row.enrolledClass;
          if (!enrolledClassId && row.ClassName && classes.length > 0) {
            const matchedClass = classes.find(
              c => c.name?.toString().toLowerCase() === row.ClassName?.toString().toLowerCase() &&
                   (!row.Section || c.section?.toString().toLowerCase() === row.Section?.toString().toLowerCase())
            );
            if (matchedClass) enrolledClassId = matchedClass._id;
          }

          // Fallback to first class if not found
          if (!enrolledClassId && classes.length > 0) {
            enrolledClassId = classes[0]._id;
          }

          return {
            name: row.Name || row.name,
            admissionNumber: row.AdmissionNumber || row.admissionNumber,
            rollNumber: row.RollNumber || row.rollNumber,
            enrolledClass: enrolledClassId,
            dob: row.DOB || row.dob,
            gender: row.Gender || row.gender || 'Male',
            fatherName: row.FatherName || row.fatherName,
            motherName: row.MotherName || row.motherName,
            contactNumber: row.ContactNumber || row.contactNumber,
            address: row.Address || row.address,
            transportMode: row.TransportMode || row.transportMode || 'Walk',
            busNumber: row.BusNumber || row.busNumber
          };
        });

        const res = await api.post('/api/students/import', { students: preparedStudents });
        setResult(res.data);
      } else {
        const preparedStaff = parsedData.map(row => ({
          name: row.Name || row.name,
          email: row.Email || row.email,
          employeeId: row.EmployeeID || row.employeeId,
          department: row.Department || row.department,
          designation: row.Designation || row.designation || 'Teacher',
          qualification: row.Qualification || row.qualification,
          experienceYears: row.ExperienceYears || row.experienceYears,
          salary: row.Salary || row.salary,
          phone: row.Phone || row.phone,
          address: row.Address || row.address
        }));

        const res = await api.post('/api/staff/import', { staff: preparedStaff });
        setResult(res.data);
      }

      onSuccess();
    } catch (err: any) {
      setResult({ message: err.response?.data?.message || 'Bulk import failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
          
          <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Bulk Import {type === 'student' ? 'Students' : 'Staff Members'} (CSV)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Upload a CSV file to enroll multiple entries at once.</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>

          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* Step 1: Download Template */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Need the CSV Format?</h4>
                <p className="text-xs text-blue-700 mt-0.5">Download our pre-formatted sample template with correct column headers.</p>
              </div>
              <Button type="button" variant="secondary" onClick={handleDownloadSample} className="text-xs py-1.5 px-3 flex items-center gap-1.5 shrink-0">
                <Download className="w-4 h-4 text-blue-600" /> Sample CSV
              </Button>
            </div>

            {/* Step 2: Upload File */}
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 transition-colors">
              <input type="file" accept=".csv" onChange={handleFileChange} id="csv-upload" className="hidden" />
              <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-800">
                  {file ? file.name : 'Click to select CSV file'}
                </span>
                <span className="text-xs text-slate-400 mt-1">Supports standard CSV files (.csv)</span>
              </label>
            </div>

            {/* Step 3: CSV Preview */}
            {parsedData.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    CSV Data Preview ({parsedData.length} Rows Detected)
                  </h4>
                </div>
                <div className="border rounded-xl overflow-x-auto max-h-44 bg-slate-50 p-2">
                  <table className="min-w-full text-xs text-slate-700 divide-y divide-slate-200">
                    <thead>
                      <tr>
                        {Object.keys(parsedData[0] || {}).map((header, idx) => (
                          <th key={idx} className="px-2 py-1 text-left font-bold text-slate-600 uppercase">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {parsedData.slice(0, 5).map((row, rIdx) => (
                        <tr key={rIdx}>
                          {Object.values(row).map((val: any, vIdx) => (
                            <td key={vIdx} className="px-2 py-1 truncate max-w-[120px]">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.length > 5 && (
                    <p className="text-[10px] text-slate-400 text-center mt-1 italic">Showing first 5 of {parsedData.length} rows</p>
                  )}
                </div>
              </div>
            )}

            {/* Results Feedback */}
            {result && (
              <div className="bg-slate-50 p-4 rounded-xl border space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-700">
                  <CheckCircle className="w-4 h-4" /> {result.message}
                </div>
                {result.errors && result.errors.length > 0 && (
                  <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100 max-h-28 overflow-y-auto space-y-1">
                    {result.errors.map((err, idx) => <div key={idx}>• {err}</div>)}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t bg-gray-50/50 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button 
              type="button" 
              onClick={handleSubmit} 
              disabled={loading || parsedData.length === 0}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> {loading ? 'Importing...' : `Import ${parsedData.length} Entries`}
            </Button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
