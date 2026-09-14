"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Wallet, CheckCircle, Clock, AlertTriangle, FileText, Calendar, Users } from 'lucide-react';
import { InvoiceModal } from '@/components/organisms/InvoiceModal';

export default function ParentFeesPage() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeeForInvoice, setSelectedFeeForInvoice] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const childrenRes = await api.get(`/api/students/children?parentId=${user?.id}`);
        const myChildren = childrenRes.data;
        setChildren(myChildren);
        
        const childIds = myChildren.map((c: any) => c._id).join(',');
        if (childIds) {
          const feesRes = await api.get(`/api/finance/fees?studentIds=${childIds}`);
          setFees(feesRes.data);
        } else {
          setFees([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchData();
  }, [user]);

  const totalAssigned = fees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const totalPaid = fees.reduce((sum, f) => sum + (Number(f.paidAmount) || (f.status === 'Paid' ? Number(f.amount) : 0)), 0);
  const totalPending = Math.max(0, totalAssigned - totalPaid);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Wallet className="w-8 h-8 text-emerald-600" /> Fees & Invoices
        </h1>
        <p className="text-slate-500 mt-1">Manage dues, track payments, and download official receipts for your children.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Paid</h3>
            <p className="text-3xl font-black text-emerald-600">${totalPaid.toLocaleString()}</p>
          </div>
          <div className="p-3.5 bg-emerald-100 text-emerald-700 rounded-2xl">
            <CheckCircle className="w-7 h-7" />
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Total Pending Dues</h3>
            <p className="text-3xl font-black text-amber-600">${totalPending.toLocaleString()}</p>
          </div>
          <div className="p-3.5 bg-amber-100 text-amber-700 rounded-2xl">
            <Clock className="w-7 h-7" />
          </div>
        </div>
      </div>

      {children.map(child => {
        const childFees = fees.filter(f => f.student?._id === child._id || f.student === child._id);
        
        return (
          <motion.div key={child._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden mt-8">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{child.user?.name}'s Fee Ledger</h3>
                  <p className="text-xs text-slate-500 font-mono">Roll: {child.rollNumber || 'N/A'} {child.admissionNumber ? `| Adm: ${child.admissionNumber}` : ''}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm capitalize">
                {child.enrolledClass?.name ? (child.enrolledClass.name.toLowerCase().startsWith('class') ? child.enrolledClass.name : `Class ${child.enrolledClass.name}`) : 'Unassigned'} - {child.enrolledClass?.section || 'A'}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Fee Description</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Total / Balance</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-medium">Loading records...</td></tr>
                  ) : childFees.length === 0 ? (
                    <tr><td colSpan={5} className="p-10 text-center text-slate-500 font-medium">No fee records found for {child.user?.name}.</td></tr>
                  ) : (
                    childFees.map(fee => {
                      const paid = fee.paidAmount !== undefined ? fee.paidAmount : (fee.status === 'Paid' ? fee.amount : 0);
                      const balance = fee.balanceAmount !== undefined ? fee.balanceAmount : (fee.amount - paid);
                      const hasPayment = paid > 0 || fee.status === 'Paid';

                      return (
                        <tr key={fee._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 text-sm">{fee.feeName || fee.remarks || 'Tuition Fee'}</div>
                            {fee.remarks && fee.remarks !== fee.feeName && (
                              <div className="text-xs text-slate-400 italic mt-0.5">{fee.remarks}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs space-y-0.5">
                              <div className="font-bold text-slate-900">Total: ${Number(fee.amount).toLocaleString()}</div>
                              <div className="text-emerald-600 font-semibold">Paid: ${Number(paid).toLocaleString()}</div>
                              {balance > 0 && <div className="text-amber-600 font-bold">Due: ${Number(balance).toLocaleString()}</div>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                {fee.remainingDueDate && fee.status === 'Partial'
                                  ? new Date(fee.remainingDueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                  : new Date(fee.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
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
                          </td>
                          <td className="px-6 py-4 text-right">
                            {hasPayment ? (
                              <button
                                onClick={() => setSelectedFeeForInvoice(fee)}
                                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs border border-indigo-200 transition-colors shadow-sm"
                              >
                                <FileText className="w-3.5 h-3.5" /> Receipt
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Unpaid</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        );
      })}

      {/* Invoice Modal */}
      {selectedFeeForInvoice && (
        <InvoiceModal
          isOpen={!!selectedFeeForInvoice}
          fee={selectedFeeForInvoice}
          onClose={() => setSelectedFeeForInvoice(null)}
        />
      )}
    </div>
  );
}
