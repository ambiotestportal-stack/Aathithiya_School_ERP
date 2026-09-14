"use client";

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { FileSpreadsheet, FileText, Users, Calculator, Activity, Bus } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';

const ReportCard = ({ title, description, icon: Icon, colorClass, delay, type }: any) => {
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  const fetchReportData = async () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (type === 'students') {
      const res = await api.get('/api/students');
      headers = ['Name', 'Roll Number', 'Admission No', 'Class', 'Section', 'Transport', 'Bus No', 'Parent Contact'];
      rows = res.data.map((s: any) => [
        s.user?.name || '',
        s.rollNumber || '',
        s.admissionNumber || '',
        s.enrolledClass?.name || '',
        s.enrolledClass?.section || '',
        s.transportMode || 'Walk',
        s.busNumber || '',
        s.contactNumber || ''
      ]);
    } else if (type === 'staff') {
      const res = await api.get('/api/staff');
      headers = ['Name', 'Employee ID', 'Subject', 'Designation', 'Email', 'Phone', 'Experience (Yrs)', 'Salary ($)'];
      rows = res.data.map((s: any) => [
        s.user?.name || '',
        s.employeeId || '',
        s.department || '',
        s.designation || '',
        s.user?.email || '',
        s.phone || '',
        s.experienceYears || 0,
        s.salary || 0
      ]);
    } else if (type === 'fees') {
      const res = await api.get('/api/finance/fees');
      headers = ['Title / Remarks', 'Student', 'Class', 'Amount ($)', 'Status', 'Due Date'];
      rows = res.data.map((f: any) => [
        f.remarks || f.title || 'Tuition Fee',
        f.student?.user?.name || 'Student',
        f.student?.enrolledClass?.name ? `Class ${f.student.enrolledClass.name}-${f.student.enrolledClass.section}` : '',
        f.amount || 0,
        f.status || 'Pending',
        f.dueDate ? new Date(f.dueDate).toLocaleDateString() : ''
      ]);
    } else if (type === 'transport') {
      const res = await api.get('/api/transport');
      headers = ['Bus No', 'Vehicle Number', 'Route', 'Driver Name', 'Driver Phone', 'Capacity', 'Allocated Students'];
      rows = res.data.map((v: any) => [
        v.busNumber || 'N/A',
        v.vehicleNumber || '',
        v.route || '',
        v.driverName || '',
        v.driverContact || '',
        `${v.capacity} Seats`,
        `${v.students?.length || 0} Students`
      ]);
    }

    return { headers, rows };
  };

  const handleExportExcel = async () => {
    setLoadingExcel(true);
    try {
      const { headers, rows } = await fetchReportData();
      exportToExcel(title, headers, rows);
    } catch (error) {
      alert(`Failed to export ${title} to Excel`);
    } finally {
      setLoadingExcel(false);
    }
  };

  const handleExportPDF = async () => {
    setLoadingPDF(true);
    try {
      const { headers, rows } = await fetchReportData();
      exportToPDF(title, description, headers, rows);
    } catch (error) {
      alert(`Failed to export ${title} to PDF`);
    } finally {
      setLoadingPDF(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay }} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm flex-1 mb-6">{description}</p>
      
      <div className="grid grid-cols-2 gap-2 mt-auto">
        <Button onClick={handleExportExcel} variant="secondary" className="flex justify-center items-center gap-1.5 text-xs py-2 px-2" disabled={loadingExcel}>
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
          {loadingExcel ? '...' : 'Excel'}
        </Button>
        <Button onClick={handleExportPDF} variant="secondary" className="flex justify-center items-center gap-1.5 text-xs py-2 px-2" disabled={loadingPDF}>
          <FileText className="w-4 h-4 text-red-600 shrink-0" />
          {loadingPDF ? '...' : 'PDF'}
        </Button>
      </div>
    </motion.div>
  );
};

export default function ReportsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Data Exports & Reports Hub</h1>
        <p className="text-slate-500 mt-1">Generate live Excel spreadsheets and printable PDF reports directly from MongoDB.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        <ReportCard 
          title="Student Registry" 
          description="Complete list of all enrolled students, their demographic data, transport mode, and assigned classes."
          icon={Users}
          colorClass="bg-blue-100 text-blue-600"
          type="students"
          delay={0}
        />
        <ReportCard 
          title="Staff Directory" 
          description="Complete list of teaching staff members, employee IDs, subjects taught, and contact details."
          icon={Users}
          colorClass="bg-purple-100 text-purple-600"
          type="staff"
          delay={0.1}
        />
        <ReportCard 
          title="Fee & Financials" 
          description="Live list of fee collection records, pending dues, and payment statuses across all classes."
          icon={Calculator}
          colorClass="bg-red-100 text-red-600"
          type="fees"
          delay={0.2}
        />
        <ReportCard 
          title="Transport Fleet" 
          description="Transport vehicle fleet report including Bus Numbers, driver contacts, routes, and capacity allocation."
          icon={Bus}
          colorClass="bg-amber-100 text-amber-600"
          type="transport"
          delay={0.3}
        />
      </div>
    </div>
  );
}
