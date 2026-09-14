"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { PaymentModal } from '@/components/organisms/PaymentModal';
import { InvoiceModal } from '@/components/organisms/InvoiceModal';
import { 
  Search, DollarSign, CreditCard, Wallet, 
  CheckCircle, Clock, AlertTriangle, FileText, Filter, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function FinanceManagementPage() {
  const [fees, setFees] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterFeeName, setFilterFeeName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState<any>(null);
  const [selectedFeeForInvoice, setSelectedFeeForInvoice] = useState<any>(null);
  const [latestTransaction, setLatestTransaction] = useState<any>(null);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [feeRes, classRes] = await Promise.all([
        api.get('/api/finance/fees'),
        api.get('/api/academic/classes')
      ]);
      setFees(feeRes.data);
      setClasses(classRes.data);
    } catch (error) {
      console.error('Failed to load finance data', error);
      toast.error('Failed to load fee collection data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const refreshFees = async () => {
    try {
      const res = await api.get('/api/finance/fees');
      setFees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Extract unique classes and sections for filters
  const uniqueClassNames = Array.from(new Set(classes.map(c => c.name)));
  const availableSections = filterClass 
    ? Array.from(new Set(classes.filter(c => c.name?.toLowerCase() === filterClass.toLowerCase()).map(c => c.section).filter(Boolean)))
    : Array.from(new Set(classes.map(c => c.section).filter(Boolean)));

  // Extract unique fee names dynamically
  const uniqueFeeNames = Array.from(new Set(fees.map(f => f.feeName || f.remarks || 'Tuition Fee').filter(Boolean)));

  const filteredFees = fees.filter(f => {
    const student = f.student || {};
    const user = student.user || {};
    const enrolledClass = student.enrolledClass || {};

    const studentName = user.name || '';
    const rollNo = student.rollNumber || '';
    const admNo = student.admissionNumber || '';
    const feeName = f.feeName || f.remarks || '';
    const className = enrolledClass.name || '';
    const sectionName = enrolledClass.section || '';

    const matchesSearch = studentName.toLowerCase().includes(search.toLowerCase()) ||
      rollNo.toLowerCase().includes(search.toLowerCase()) ||
      admNo.toLowerCase().includes(search.toLowerCase()) ||
      feeName.toLowerCase().includes(search.toLowerCase());

    const matchesClass = !filterClass || className.toLowerCase() === filterClass.toLowerCase();
    const matchesSection = !filterSection || sectionName.toLowerCase() === filterSection.toLowerCase();
    const matchesFeeName = !filterFeeName || feeName.toLowerCase() === filterFeeName.toLowerCase();
    const matchesStatus = !filterStatus || f.status === filterStatus;

    return matchesSearch && matchesClass && matchesSection && matchesFeeName && matchesStatus;
  });

  const totalAssigned = fees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const totalCollected = fees.reduce((sum, f) => sum + (Number(f.paidAmount) || 0), 0);
  const totalPending = Math.max(0, totalAssigned - totalCollected);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Wallet className="w-8 h-8 text-emerald-600" /> Finance Management
          </h1>
          <p className="text-slate-500 mt-1">Student fee collection portal, payment recording, balance tracking & invoice issuance.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Fee Assigned</h3>
            <p className="text-2xl font-black text-slate-900 mt-0.5">${totalAssigned.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Total Collected</h3>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">${totalCollected.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider">Total Pending Balance</h3>
            <p className="text-2xl font-black text-amber-600 mt-0.5">${totalPending.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          
          {/* Search Bar */}
          <div className="relative sm:col-span-2 lg:col-span-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by student, roll, or fee name..." 
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-blue-500 text-xs font-medium text-slate-800 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Fee Name Filter */}
          <div className="w-full">
            <select
              value={filterFeeName}
              onChange={(e) => setFilterFeeName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white text-xs font-semibold text-slate-700 truncate"
            >
              <option value="">All Fee Names</option>
              {uniqueFeeNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div className="w-full">
            <select
              value={filterClass}
              onChange={(e) => {
                setFilterClass(e.target.value);
                setFilterSection('');
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white text-xs font-semibold text-slate-700"
            >
              <option value="">All Classes</option>
              {uniqueClassNames.map(name => (
                <option key={name} value={name}>
                  {name.toLowerCase().startsWith('class') ? name : `Class ${name}`}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div className="w-full">
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white text-xs font-semibold text-slate-700"
            >
              <option value="">All Sections</option>
              {availableSections.map(sec => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white text-xs font-semibold text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

        </div>
      </div>

      {/* Fee Collection Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/70">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Student Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Class & Sec</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Fee Description</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Paid / Balance</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status & Due Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    Loading student fee collection records...
                  </td>
                </tr>
              ) : filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <p className="text-slate-600 font-bold text-base">No fee collection records match the filter</p>
                    <p className="text-slate-400 text-xs mt-1">Try choosing a different class, section, fee name, or clear the filter.</p>
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => {
                  const student = fee.student || {};
                  const user = student.user || {};
                  const enrolledClass = student.enrolledClass || {};
                  const balance = fee.balanceAmount !== undefined ? fee.balanceAmount : (fee.amount - (fee.paidAmount || 0));
                  const isPaid = fee.status === 'Paid' || balance <= 0;

                  return (
                    <tr key={fee._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Student Details */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{user.name || 'Enrolled Student'}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          Roll: <span className="font-bold">{student.rollNumber || 'N/A'}</span> {student.admissionNumber ? `| Adm: ${student.admissionNumber}` : ''}
                        </div>
                      </td>

                      {/* Class & Section */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-sm capitalize">
                          {enrolledClass.name ? (enrolledClass.name.toLowerCase().startsWith('class') ? enrolledClass.name : `Class ${enrolledClass.name}`) : 'Unassigned'}
                        </div>
                        <div className="text-xs text-slate-500">
                          Section: {enrolledClass.section || 'A'}
                        </div>
                      </td>

                      {/* Fee Description */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{fee.feeName || fee.remarks || 'Term Fee'}</div>
                        <div className="text-xs text-slate-400 font-mono">
                          Total: <span className="font-black text-slate-700">${Number(fee.amount).toLocaleString()}</span>
                        </div>
                      </td>

                      {/* Paid / Balance */}
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-1">
                          <div className="font-bold text-emerald-600 flex items-center justify-between gap-2">
                            <span>Paid:</span>
                            <span>${Number(fee.paidAmount || 0).toLocaleString()}</span>
                          </div>
                          <div className="font-bold text-amber-600 flex items-center justify-between gap-2">
                            <span>Balance:</span>
                            <span>${Number(balance).toLocaleString()}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status & Due Date */}
                      <td className="px-6 py-4">
                        <div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                            fee.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                            fee.status === 'Partial' ? 'bg-amber-100 text-amber-800' :
                            fee.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {fee.status === 'Paid' && <CheckCircle className="w-3 h-3" />}
                            {fee.status === 'Partial' && <Clock className="w-3 h-3" />}
                            {fee.status === 'Overdue' && <AlertTriangle className="w-3 h-3" />}
                            {fee.status || 'Pending'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-1.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {fee.remainingDueDate && fee.status === 'Partial' 
                            ? `Next: ${new Date(fee.remainingDueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
                            : `Due: ${new Date(fee.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
                          }
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isPaid && (
                            <button
                              onClick={() => setSelectedFeeForPayment(fee)}
                              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Mark Paid
                            </button>
                          )}

                          {(fee.paidAmount > 0 || isPaid) && (
                            <button
                              onClick={() => {
                                setSelectedFeeForInvoice(fee);
                                setLatestTransaction(null);
                              }}
                              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <FileText className="w-3.5 h-3.5 text-indigo-600" /> Invoice
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Payment Modal */}
      {selectedFeeForPayment && (
        <PaymentModal
          isOpen={!!selectedFeeForPayment}
          fee={selectedFeeForPayment}
          onClose={() => setSelectedFeeForPayment(null)}
          onSuccess={(res) => {
            refreshFees();
            if (res.fee) {
              setSelectedFeeForInvoice(res.fee);
              setLatestTransaction(res.transaction);
            }
          }}
        />
      )}

      {/* Invoice Modal */}
      {selectedFeeForInvoice && (
        <InvoiceModal
          isOpen={!!selectedFeeForInvoice}
          fee={selectedFeeForInvoice}
          transaction={latestTransaction}
          onClose={() => {
            setSelectedFeeForInvoice(null);
            setLatestTransaction(null);
          }}
        />
      )}
    </div>
  );
}
