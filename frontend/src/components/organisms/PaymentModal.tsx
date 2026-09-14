"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { 
  X, CheckCircle, DollarSign, CreditCard, 
  Smartphone, Banknote, Calendar, AlertCircle, Calculator, Sparkles, Hash
} from 'lucide-react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { isPositiveNumber, isValidDate } from '@/lib/validation';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  fee: any;
  onSuccess: (paymentResult: any) => void;
}

export const PaymentModal = ({ isOpen, onClose, fee, onSuccess }: PaymentModalProps) => {
  const [paymentDate, setPaymentDate] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'Card'>('Cash');
  const [transactionId, setTransactionId] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [remainingDueDate, setRemainingDueDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentBalance = fee ? (fee.balanceAmount !== undefined ? fee.balanceAmount : (fee.amount - (fee.paidAmount || 0))) : 0;

  useEffect(() => {
    if (isOpen && fee) {
      setError('');
      // Set default payment date to today in YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      setPaymentDate(today);
      setAmountPaid(currentBalance.toString());
      setPaymentMethod('Cash');
      setTransactionId('');
      setCashReceived('');
      setRemainingDueDate('');
      setRemarks('');
    }
  }, [isOpen, fee, currentBalance]);

  if (!isOpen || !fee) return null;

  const numAmountPaid = Number(amountPaid) || 0;
  const numCashReceived = Number(cashReceived) || 0;
  const isPartial = numAmountPaid < currentBalance;
  const remainingBalance = Math.max(0, currentBalance - numAmountPaid);
  const cashChange = paymentMethod === 'Cash' && numCashReceived >= numAmountPaid 
    ? (numCashReceived - numAmountPaid) 
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPositiveNumber(numAmountPaid)) {
      setError('Please enter a valid payment amount greater than 0');
      return;
    }

    if (numAmountPaid > currentBalance) {
      setError(`Payment amount ($${numAmountPaid}) cannot exceed outstanding balance ($${currentBalance})`);
      return;
    }

    if (!paymentDate || !isValidDate(paymentDate)) {
      setError('Please provide a valid date of payment');
      return;
    }

    if ((paymentMethod === 'UPI' || paymentMethod === 'Card') && !transactionId.trim()) {
      setError(`Please enter the ${paymentMethod} Transaction / Reference ID`);
      return;
    }

    if (paymentMethod === 'Cash' && cashReceived !== '' && numCashReceived < numAmountPaid) {
      setError(`Cash given ($${numCashReceived}) is less than the amount paying ($${numAmountPaid})`);
      return;
    }

    if (isPartial && !remainingDueDate) {
      setError(`Please provide a due date for the remaining balance ($${remainingBalance})`);
      return;
    }

    if (isPartial && remainingDueDate && !isValidDate(remainingDueDate)) {
      setError('Please provide a valid remaining fee due date');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        amountPaid: numAmountPaid,
        paymentDate,
        paymentMethod,
        transactionId: (paymentMethod === 'UPI' || paymentMethod === 'Card') ? transactionId.trim() : undefined,
        cashReceived: paymentMethod === 'Cash' && cashReceived !== '' ? numCashReceived : undefined,
        cashChange: paymentMethod === 'Cash' && cashReceived !== '' ? cashChange : undefined,
        remainingDueDate: isPartial ? remainingDueDate : undefined,
        remarks: remarks?.trim() || `Payment for ${fee.feeName || 'Fee'}`
      };

      const res = await api.put(`/api/finance/fees/${fee._id}/pay`, payload);
      toast.success(res.data.message || 'Payment recorded successfully');
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="px-6 py-4 border-b flex justify-between items-center bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Collect Student Fee</h3>
                <p className="text-xs text-slate-500">Record payment, calculate change & set installment due dates</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>

          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            
            {/* Student & Fee Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{fee.student?.user?.name || 'Student'}</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {fee.student?.enrolledClass?.name ? `Class ${fee.student.enrolledClass.name} - ${fee.student.enrolledClass.section || 'A'}` : 'Unassigned'} | Roll: {fee.student?.rollNumber || 'N/A'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold">
                  {fee.feeName || fee.remarks || 'Term Fee'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-center">
                <div className="p-2 bg-white rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Fee</span>
                  <span className="text-sm font-black text-slate-800">${Number(fee.amount).toLocaleString()}</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Already Paid</span>
                  <span className="text-sm font-black text-emerald-600">${Number(fee.paidAmount || 0).toLocaleString()}</span>
                </div>
                <div className="p-2 bg-amber-50 rounded-xl border border-amber-200/60">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Balance Due</span>
                  <span className="text-sm font-black text-amber-600">${Number(currentBalance).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
              
              {/* Payment Date & Amount */}
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  label="Date of Payment" 
                  id="paymentDate" 
                  type="date" 
                  value={paymentDate} 
                  onChange={(e) => setPaymentDate(e.target.value)} 
                  required 
                />
                <Input 
                  label="Amount Paying ($)" 
                  id="amountPaid" 
                  type="number" 
                  placeholder={`Max: ${currentBalance}`}
                  value={amountPaid} 
                  onChange={(e) => setAmountPaid(e.target.value)} 
                  required 
                />
              </div>

              {/* Payment Type Selection */}
              <div>
                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                  Payment Mode / Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all border ${
                      paymentMethod === 'Cash' 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Banknote className="w-4 h-4" /> Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all border ${
                      paymentMethod === 'UPI' 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" /> UPI / QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all border ${
                      paymentMethod === 'Card' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" /> Card
                  </button>
                </div>
              </div>

              {/* UPI or Card Transaction ID Input */}
              {(paymentMethod === 'UPI' || paymentMethod === 'Card') && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  className="space-y-1.5"
                >
                  <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-indigo-600" />
                    {paymentMethod === 'UPI' ? 'UPI Transaction ID / UTR Number' : 'Card Transaction Ref / Auth Code'} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder={paymentMethod === 'UPI' ? 'e.g. UPI/123456789012 or UTR Ref' : 'e.g. TXN-8932014 or Auth Code'}
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-300 bg-indigo-50/30 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-500 block">
                    Enter the payment reference number generated by your {paymentMethod} payment app/terminal.
                  </span>
                </motion.div>
              )}

              {/* Cash Calculator Section (If Cash Selected) */}
              {paymentMethod === 'Cash' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <Calculator className="w-4 h-4 text-emerald-700" /> Cash Received & Change Calculator
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-900 mb-1">Cash Given by Payer ($)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 10000"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-900 mb-1">Balance / Change to Give</label>
                      <div className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-100/70 text-sm font-black text-emerald-800 flex items-center justify-between">
                        <span>Change:</span>
                        <span className="text-base">${cashChange.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Partial Payment: Remaining Fee Due Date */}
              {isPartial && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <Calendar className="w-4 h-4 text-amber-700" /> Partial Payment Detected
                    </div>
                    <span className="text-xs font-extrabold text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-md">
                      Remaining Balance: ${remainingBalance.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      Remaining Fee Due Date <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="date" 
                      value={remainingDueDate}
                      onChange={(e) => setRemainingDueDate(e.target.value)}
                      required={isPartial}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-[11px] text-amber-800 mt-1 block">
                      Please schedule when the remaining balance (${remainingBalance}) is due.
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Payment Remarks (Optional)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Paid via Google Pay / Counter" 
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

            </form>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t bg-gray-50/70 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button 
              form="payment-form" 
              type="submit" 
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <CheckCircle className="w-4 h-4" /> {loading ? 'Recording...' : `Record Payment ($${numAmountPaid.toLocaleString()})`}
            </Button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
