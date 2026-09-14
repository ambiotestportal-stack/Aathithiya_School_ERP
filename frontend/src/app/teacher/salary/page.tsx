"use client";

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { FileText, Download, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const DUMMY_PAYSLIPS = [
  { id: 1, month: 'August 2026', basic: 4000, allowances: 800, deductions: 200, net: 4600, status: 'Paid', date: '2026-08-01' },
  { id: 2, month: 'July 2026', basic: 4000, allowances: 800, deductions: 200, net: 4600, status: 'Paid', date: '2026-07-01' },
  { id: 3, month: 'June 2026', basic: 4000, allowances: 800, deductions: 200, net: 4600, status: 'Paid', date: '2026-06-01' },
];

export default function TeacherSalaryPage() {
  const [downloading, setDownloading] = useState<number | null>(null);

  const handleDownload = (id: number) => {
    setDownloading(id);
    setTimeout(() => {
      setDownloading(null);
      alert('Payslip downloaded successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Salary & Payslips</h1>
        <p className="text-slate-500 mt-1">View your payroll history and download monthly payslips.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-emerald-500 rounded-2xl p-6 text-white shadow-sm">
          <Wallet className="w-8 h-8 mb-4 text-emerald-100" />
          <p className="text-emerald-100 font-medium">Last Month Net Pay</p>
          <h2 className="text-3xl font-black">$4,600.00</h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Basic Pay</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Allowances</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Deductions</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Net Pay</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DUMMY_PAYSLIPS.map((slip, i) => (
                <motion.tr key={slip.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-slate-800">{slip.month}</div>
                    <div className="text-xs text-slate-500">Credited on {new Date(slip.date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">${slip.basic}</td>
                  <td className="px-6 py-4 font-medium text-emerald-600">+${slip.allowances}</td>
                  <td className="px-6 py-4 font-medium text-red-500">-${slip.deductions}</td>
                  <td className="px-6 py-4 font-black text-slate-900">${slip.net}</td>
                  <td className="px-6 py-4 text-center">
                    <Button variant="secondary" onClick={() => handleDownload(slip.id)} disabled={downloading === slip.id} className="text-xs px-3 py-1.5 flex items-center gap-2 mx-auto">
                      <Download className="w-4 h-4" />
                      {downloading === slip.id ? 'Downloading...' : 'PDF'}
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
