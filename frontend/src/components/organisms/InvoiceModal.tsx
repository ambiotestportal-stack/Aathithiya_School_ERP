"use client";

import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import { X, Printer, Download, CheckCircle, GraduationCap, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  fee: any;
  transaction?: any;
}

export const InvoiceModal = ({ isOpen, onClose, fee, transaction }: InvoiceModalProps) => {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !fee) return null;

  const currentTransaction = transaction || (fee.payments && fee.payments.length > 0 ? fee.payments[fee.payments.length - 1] : {
    receiptNumber: `REC-${new Date().getFullYear()}-0001`,
    amount: fee.paidAmount || fee.amount,
    paymentDate: fee.paymentDate || new Date(),
    paymentMethod: fee.paymentMethod || 'Cash',
    transactionId: fee.transactionId,
    remarks: fee.remarks || 'Fee Payment'
  });

  const student = fee.student || {};
  const user = student.user || {};
  const enrolledClass = student.enrolledClass || {};
  const effectiveTxnId = currentTransaction.transactionId || fee.transactionId;

  const classNameStr = enrolledClass.name 
    ? (enrolledClass.name.toLowerCase().startsWith('class') ? enrolledClass.name : `Class ${enrolledClass.name}`)
    : 'N/A';
  const sectionStr = enrolledClass.section || 'A';
  const receiptNo = currentTransaction.receiptNumber || 'REC-2026-0001';
  const paymentDateStr = new Date(currentTransaction.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const feeNameStr = fee.feeName || fee.remarks || 'Tuition Fee';
  const totalAmountStr = `$${Number(fee.amount).toLocaleString()}`;
  const paidInTxnStr = `$${Number(currentTransaction.amount || fee.paidAmount || fee.amount).toLocaleString()}`;
  const balanceStr = fee.balanceAmount !== undefined && fee.balanceAmount > 0 ? `$${Number(fee.balanceAmount).toLocaleString()}` : '$0';
  const remainingDueDateStr = fee.remainingDueDate 
    ? new Date(fee.remainingDueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : (fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A');

  // Direct Vector PDF Generation (100% crash-free, no canvas/lab CSS issues)
  const handleDownloadPdf = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      // Background Header Bar
      doc.setFillColor(37, 99, 235); // #2563eb Blue
      doc.rect(0, 0, pageWidth, 28, 'F');

      // School Branding Header
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('EduERP Public School', 15, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('Affiliated to CBSE | School Code: 89320 | 123 Education Boulevard, Chennai', 15, 18);
      doc.text('Email: accounts@eduerp.edu | Phone: +91 98401 23456', 15, 23);

      // Official Receipt Badge
      doc.setFillColor(16, 185, 129); // #10b981 Green
      doc.roundedRect(pageWidth - 55, 8, 40, 12, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text('OFFICIAL RECEIPT', pageWidth - 35, 15.5, { align: 'center' });

      // Receipt Metadata Bar
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`Receipt No: ${receiptNo}`, 15, 38);
      doc.setFont('helvetica', 'normal');
      doc.text(`Issue Date: ${paymentDateStr}`, pageWidth - 15, 38, { align: 'right' });

      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 42, pageWidth - 15, 42);

      // Student & Payment Details Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, 46, pageWidth - 30, 42, 3, 3, 'F');
      doc.rect(15, 46, pageWidth - 30, 42, 'S');

      // Student Column
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('STUDENT INFORMATION', 20, 53);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(user.name || 'Student Name', 20, 60);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(`Class: ${classNameStr} - Section ${sectionStr}`, 20, 66);
      doc.text(`Roll No: ${student.rollNumber || 'N/A'}  |  Adm No: ${student.admissionNumber || 'N/A'}`, 20, 72);
      if (student.parent?.name) {
        doc.text(`Parent: ${student.parent.name}`, 20, 78);
      }

      // Payment Details Column
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('PAYMENT DETAILS', pageWidth / 2 + 10, 53);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(`Payment Mode: ${currentTransaction.paymentMethod || 'Cash'}`, pageWidth / 2 + 10, 60);
      if (effectiveTxnId) {
        doc.setFont('helvetica', 'bold');
        doc.text(`Txn / Ref ID: ${effectiveTxnId}`, pageWidth / 2 + 10, 66);
        doc.setFont('helvetica', 'normal');
      }
      doc.text(`Payment Date: ${paymentDateStr}`, pageWidth / 2 + 10, effectiveTxnId ? 72 : 66);
      if (currentTransaction.cashReceived !== undefined) {
        doc.text(`Cash Given: $${currentTransaction.cashReceived}  |  Change: $${currentTransaction.cashChange || 0}`, pageWidth / 2 + 10, effectiveTxnId ? 78 : 72);
      }
      doc.text(`Status: ${fee.status || 'Paid'}`, pageWidth / 2 + 10, effectiveTxnId ? (currentTransaction.cashReceived ? 84 : 78) : (currentTransaction.cashReceived ? 78 : 72));

      // Itemized Table Header
      let y = 96;
      doc.setFillColor(241, 245, 249);
      doc.rect(15, y, pageWidth - 30, 8, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(15, y, pageWidth - 30, 8, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text('FEE PARTICULARS / DESCRIPTION', 20, y + 5.5);
      doc.text('TOTAL FEE', pageWidth - 70, y + 5.5, { align: 'center' });
      doc.text('AMOUNT PAID', pageWidth - 20, y + 5.5, { align: 'right' });

      // Table Row
      y += 8;
      doc.setFillColor(255, 255, 255);
      doc.rect(15, y, pageWidth - 30, 14, 'F');
      doc.rect(15, y, pageWidth - 30, 14, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(feeNameStr, 20, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(fee.remarks && fee.remarks !== feeNameStr ? fee.remarks : 'Academic Session 2026-2027', 20, y + 10.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(totalAmountStr, pageWidth - 70, y + 8, { align: 'center' });

      doc.setTextColor(16, 185, 129);
      doc.text(paidInTxnStr, pageWidth - 20, y + 8, { align: 'right' });

      // Total Paid Summary Row
      y += 14;
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, pageWidth - 30, 9, 'F');
      doc.rect(15, y, pageWidth - 30, 9, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text('TOTAL PAID IN THIS TRANSACTION:', pageWidth - 70, y + 6, { align: 'right' });
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(11);
      doc.text(paidInTxnStr, pageWidth - 20, y + 6.5, { align: 'right' });

      // Outstanding Balance Row (if any)
      if (fee.balanceAmount !== undefined && fee.balanceAmount > 0) {
        y += 9;
        doc.setFillColor(254, 243, 199); // Light amber
        doc.rect(15, y, pageWidth - 30, 9, 'F');
        doc.setDrawColor(251, 191, 36);
        doc.rect(15, y, pageWidth - 30, 9, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(180, 83, 9);
        doc.text('OUTSTANDING REMAINING BALANCE:', pageWidth - 70, y + 6, { align: 'right' });
        doc.setFontSize(11);
        doc.text(balanceStr, pageWidth - 20, y + 6.5, { align: 'right' });

        // Next installment notice
        y += 13;
        doc.setFillColor(255, 251, 235);
        doc.roundedRect(15, y, pageWidth - 30, 10, 2, 2, 'F');
        doc.rect(15, y, pageWidth - 30, 10, 'S');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(180, 83, 9);
        doc.text(`NEXT INSTALLMENT DUE DATE: ${remainingDueDateStr}`, 20, y + 6.5);
      }

      // Footer Signatures & Terms
      const footerY = 240;
      doc.setDrawColor(203, 213, 225);
      doc.line(15, footerY, pageWidth - 15, footerY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('This is an official computer-generated fee receipt of EduERP Public School.', 15, footerY + 6);
      doc.text('For billing inquiries, please contact the accounts department at accounts@eduerp.edu', 15, footerY + 10);

      // Signatory
      doc.line(pageWidth - 65, footerY + 15, pageWidth - 15, footerY + 15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text('Authorized Signatory', pageWidth - 40, footerY + 19, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('Accounts Department', pageWidth - 40, footerY + 23, { align: 'center' });

      // Save PDF directly
      doc.save(`Fee_Receipt_${receiptNo}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setDownloading(false);
    }
  };

  // Clean Isolated Iframe Printing (Zero website background/headers/URLs)
  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fee Receipt - ${receiptNo}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            }
            body {
              background: #ffffff;
              color: #0f172a;
              padding: 10px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .school-name {
              font-size: 22px;
              font-weight: 900;
              color: #1e3a8a;
            }
            .subtext {
              font-size: 11px;
              color: #64748b;
              margin-top: 3px;
            }
            .badge {
              background: #10b981;
              color: #ffffff;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 800;
              display: inline-block;
              text-transform: uppercase;
            }
            .meta-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 15px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 10px;
              font-weight: 800;
              color: #94a3b8;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .info-main {
              font-size: 15px;
              font-weight: 800;
              color: #0f172a;
              margin-bottom: 4px;
            }
            .info-line {
              font-size: 12px;
              color: #334155;
              margin-bottom: 3px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              overflow: hidden;
              margin-bottom: 20px;
            }
            th {
              background: #f1f5f9;
              text-align: left;
              padding: 10px 14px;
              font-size: 11px;
              font-weight: 800;
              color: #475569;
              text-transform: uppercase;
              border-bottom: 1px solid #cbd5e1;
            }
            td {
              padding: 12px 14px;
              font-size: 13px;
              border-bottom: 1px solid #f1f5f9;
            }
            .total-row {
              background: #f8fafc;
              font-weight: 800;
            }
            .balance-row {
              background: #fef3c7;
              color: #92400e;
              font-weight: 800;
            }
            .notice-box {
              background: #fffbeb;
              border: 1px solid #fde68a;
              color: #b45309;
              padding: 10px 14px;
              border-radius: 8px;
              font-size: 12px;
              font-weight: 700;
              margin-bottom: 25px;
            }
            .footer {
              margin-top: 40px;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .sign-box {
              text-align: center;
              width: 160px;
            }
            .sign-line {
              border-bottom: 1px solid #0f172a;
              margin-bottom: 5px;
              height: 25px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="school-name">EduERP Public School</div>
              <div class="subtext">Affiliated to CBSE | School Code: 89320 | Knowledge City, Chennai</div>
            </div>
            <div style="text-align: right;">
              <span class="badge">Official Receipt</span>
              <div style="font-size: 12px; font-weight: bold; margin-top: 6px; font-family: monospace;">${receiptNo}</div>
              <div style="font-size: 11px; color: #64748b;">Date: ${paymentDateStr}</div>
            </div>
          </div>

          <div class="meta-box">
            <div>
              <div class="section-title">Student Information</div>
              <div class="info-main">${user.name || 'Student Name'}</div>
              <div class="info-line">Class: <strong>${classNameStr} - Section ${sectionStr}</strong></div>
              <div class="info-line">Roll No: <strong>${student.rollNumber || 'N/A'}</strong> | Adm No: <strong>${student.admissionNumber || 'N/A'}</strong></div>
              ${student.parent?.name ? `<div class="info-line">Parent: <strong>${student.parent.name}</strong></div>` : ''}
            </div>
            <div>
              <div class="section-title">Payment Transaction</div>
              <div class="info-line">Mode: <strong>${currentTransaction.paymentMethod || 'Cash'}</strong></div>
              ${effectiveTxnId ? `<div class="info-line">Txn / UTR ID: <strong>${effectiveTxnId}</strong></div>` : ''}
              <div class="info-line">Date: <strong>${paymentDateStr}</strong></div>
              ${currentTransaction.cashReceived !== undefined ? `<div class="info-line" style="color: #047857;">Cash Given: $${currentTransaction.cashReceived} | Change: $${currentTransaction.cashChange || 0}</div>` : ''}
              <div class="info-line">Status: <strong style="color: #10b981;">${fee.status || 'Paid'}</strong></div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Total Fee</th>
                <th style="text-align: right;">Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${feeNameStr}</strong>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${fee.remarks && fee.remarks !== feeNameStr ? fee.remarks : 'Academic Session 2026-2027'}</div>
                </td>
                <td style="text-align: center; font-weight: bold;">${totalAmountStr}</td>
                <td style="text-align: right; font-weight: 900; color: #10b981;">${paidInTxnStr}</td>
              </tr>
              <tr class="total-row">
                <td colspan="2" style="text-align: right; font-size: 11px; color: #475569;">TOTAL PAID IN THIS TRANSACTION:</td>
                <td style="text-align: right; font-size: 15px; color: #10b981;">${paidInTxnStr}</td>
              </tr>
              ${fee.balanceAmount !== undefined && fee.balanceAmount > 0 ? `
              <tr class="balance-row">
                <td colspan="2" style="text-align: right; font-size: 11px;">OUTSTANDING REMAINING BALANCE:</td>
                <td style="text-align: right; font-size: 15px;">${balanceStr}</td>
              </tr>
              ` : ''}
            </tbody>
          </table>

          ${fee.balanceAmount !== undefined && fee.balanceAmount > 0 ? `
            <div class="notice-box">
              NEXT INSTALLMENT DUE DATE: ${remainingDueDateStr} &nbsp;|&nbsp; Please clear remaining ${balanceStr} before due date.
            </div>
          ` : ''}

          <div class="footer">
            <div style="font-size: 10px; color: #94a3b8;">
              <p>This is a computer-generated official receipt.</p>
              <p>For accounts inquiries, email accounts@eduerp.edu</p>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div style="font-size: 11px; font-weight: bold; color: #334155;">Authorized Signatory</div>
              <div style="font-size: 9px; color: #64748b;">Accounts Department</div>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full relative z-10 overflow-hidden flex flex-col max-h-[95vh]">
          
          {/* Action Header */}
          <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <CheckCircle className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-800">Fee Payment Receipt / Invoice</h3>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Direct PDF Download Button */}
              <Button 
                onClick={handleDownloadPdf} 
                disabled={downloading}
                className="flex items-center gap-1.5 py-1.5 px-3.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-bold rounded-xl"
              >
                {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {downloading ? 'Downloading...' : 'Download PDF'}
              </Button>

              {/* Print Button */}
              <Button 
                onClick={handlePrint} 
                className="flex items-center gap-1.5 py-1.5 px-3.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-bold rounded-xl"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </Button>

              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Modal Receipt Preview */}
          <div className="p-8 sm:p-10 overflow-y-auto space-y-6 bg-white text-slate-900">
            
            {/* School Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">EduERP Public School</h1>
                  <p className="text-xs text-slate-500 font-medium">Affiliated to CBSE | School Code: 89320</p>
                  <p className="text-xs text-slate-400">123 Education Boulevard, Knowledge City, Chennai</p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
                  Official Receipt
                </span>
                <div className="mt-2 text-xs font-mono font-bold text-slate-700">
                  {receiptNo}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Date: {paymentDateStr}
                </div>
              </div>
            </div>

            {/* Student & Payment Summary Grid */}
            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student Information</span>
                <p className="text-base font-bold text-slate-900">{user.name || 'Student Name'}</p>
                <p className="text-xs text-slate-600">
                  Class: <span className="font-semibold">{classNameStr} - {sectionStr}</span>
                </p>
                <p className="text-xs text-slate-600 font-mono">
                  Roll No: <span className="font-semibold">{student.rollNumber || 'N/A'}</span> {student.admissionNumber ? `| Adm No: ${student.admissionNumber}` : ''}
                </p>
                {student.parent?.name && (
                  <p className="text-xs text-slate-600">
                    Parent / Guardian: <span className="font-semibold">{student.parent.name}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1 text-right sm:text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Details</span>
                <p className="text-xs text-slate-600">
                  Payment Mode: <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{currentTransaction.paymentMethod || 'Cash'}</span>
                </p>
                {effectiveTxnId && (
                  <p className="text-xs text-slate-700 font-mono">
                    Txn / UTR ID: <span className="font-bold text-indigo-900 bg-indigo-100/60 px-1.5 py-0.5 rounded">{effectiveTxnId}</span>
                  </p>
                )}
                <p className="text-xs text-slate-600">
                  Payment Date: <span className="font-semibold">{paymentDateStr}</span>
                </p>
                {currentTransaction.cashReceived !== undefined && (
                  <p className="text-xs text-emerald-700 font-medium">
                    Cash Given: <span className="font-bold">${currentTransaction.cashReceived}</span> | Change: <span className="font-bold">${currentTransaction.cashChange || 0}</span>
                  </p>
                )}
                <p className="text-xs text-slate-500 italic mt-1">
                  Status: <span className="font-bold text-emerald-600">{fee.status || 'Paid'}</span>
                </p>
              </div>
            </div>

            {/* Fee Itemization Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100/70">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-slate-700 uppercase text-xs">Particulars / Fee Description</th>
                    <th className="px-4 py-3 text-center font-bold text-slate-700 uppercase text-xs">Total Fee</th>
                    <th className="px-4 py-3 text-right font-bold text-slate-700 uppercase text-xs">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{feeNameStr}</div>
                      <div className="text-xs text-slate-400">{fee.remarks && fee.remarks !== feeNameStr ? fee.remarks : 'Academic Session 2026-2027'}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                      {totalAmountStr}
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-emerald-600">
                      {paidInTxnStr}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-right text-xs uppercase text-slate-500">Total Paid in this transaction:</td>
                    <td className="px-4 py-3 text-right text-emerald-600 text-base font-black">
                      {paidInTxnStr}
                    </td>
                  </tr>
                  {fee.balanceAmount !== undefined && fee.balanceAmount > 0 && (
                    <tr className="bg-amber-50 text-amber-900">
                      <td colSpan={2} className="px-4 py-2.5 text-right text-xs uppercase font-extrabold">
                        Outstanding Remaining Balance:
                      </td>
                      <td className="px-4 py-2.5 text-right text-base font-black text-amber-700">
                        {balanceStr}
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>

            {/* Remaining Fee Due Notice */}
            {fee.balanceAmount !== undefined && fee.balanceAmount > 0 && (
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <div>
                  <span className="font-extrabold uppercase tracking-wide">Next Installment Due Date:</span>{' '}
                  <span className="font-bold text-sm underline ml-1">
                    {remainingDueDateStr}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-amber-800">Please pay remaining {balanceStr} before the due date.</span>
              </div>
            )}

            {/* Footer Signatures */}
            <div className="pt-8 flex justify-between items-end border-t border-slate-200">
              <div className="text-xs text-slate-400 space-y-1">
                <p>This is a computer-generated receipt.</p>
                <p>For any queries, please reach out to accounts@school.edu</p>
              </div>
              <div className="text-center">
                <div className="w-36 border-b border-slate-400 pb-1 mb-1 font-signature text-xs italic text-slate-700">
                  Authorized Signatory
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Accounts Department</span>
              </div>
            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
