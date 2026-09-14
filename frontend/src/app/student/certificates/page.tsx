"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { FileBadge, Printer, Download, Award, CheckCircle, School } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

export default function StudentCertificatesPage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [certType, setCertType] = useState('Bonafide');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/students/me?userId=${user?.id}`);
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch student profile', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchProfile();
  }, [user]);

  const handlePrintCertificate = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups to print certificate.');
      return;
    }

    const studentName = user?.name || profile?.user?.name || 'Student';
    const className = profile?.enrolledClass?.name ? `Class ${profile.enrolledClass.name} - ${profile.enrolledClass.section}` : 'Class 1-A';
    const admNo = profile?.admissionNumber || 'ADM-2026-001';
    const rollNo = profile?.rollNumber || '101';
    const fatherName = profile?.fatherName || 'Guardian';
    const issueDate = new Date().toLocaleDateString();

    const certTitle = certType === 'Bonafide' ? 'BONAFIDE CERTIFICATE' :
                      certType === 'Character' ? 'CHARACTER & CONDUCT CERTIFICATE' : 'FEE CLEARANCE CERTIFICATE';

    const certText = certType === 'Bonafide'
      ? `This is to certify that <strong>${studentName}</strong>, Son/Daughter of <strong>Mr. ${fatherName}</strong>, bearing Roll No. <strong>${rollNo}</strong> and Admission No. <strong>${admNo}</strong>, is a bona fide student of this institution currently studying in <strong>${className}</strong> for the academic year 2026.`
      : certType === 'Character'
      ? `This is to certify that <strong>${studentName}</strong>, enrolled in <strong>${className}</strong> (Roll No. <strong>${rollNo}</strong>), bears a good moral character, exemplary conduct, and active participation in school curricular activities.`
      : `This is to certify that all prescribed academic tuition and institutional fees for student <strong>${studentName}</strong> (Admission No. <strong>${admNo}</strong>) have been fully cleared for the current academic session.`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${certTitle} - ${studentName}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 20mm;
            }
            body {
              font-family: 'Georgia', serif;
              color: #1e293b;
              margin: 0;
              padding: 40px;
              text-align: center;
              background-color: #ffffff;
            }
            .cert-border {
              border: 10px double #2563eb;
              padding: 30px;
              border-radius: 12px;
              min-height: 700px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              position: relative;
            }
            .school-logo {
              font-size: 28px;
              font-weight: bold;
              color: #1e40af;
              letter-spacing: 1px;
              text-transform: uppercase;
            }
            .school-sub {
              font-size: 13px;
              color: #64748b;
              margin-top: 4px;
              font-family: sans-serif;
            }
            .cert-header {
              font-size: 22px;
              font-weight: bold;
              color: #1e293b;
              margin-top: 40px;
              margin-bottom: 30px;
              text-decoration: underline;
              letter-spacing: 2px;
            }
            .cert-body {
              font-size: 16px;
              line-height: 2.2;
              color: #334155;
              padding: 0 40px;
              margin-bottom: 40px;
            }
            .footer-grid {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 60px;
              padding: 0 30px;
              font-family: sans-serif;
            }
            .signature {
              border-top: 2px solid #94a3b8;
              width: 180px;
              padding-top: 6px;
              font-size: 13px;
              font-weight: bold;
              color: #475569;
            }
          </style>
        </head>
        <body>
          <div class="cert-border">
            <div>
              <div class="school-logo">EduERP International Academy</div>
              <div class="school-sub">Affiliated to Central Board of Education | Main Campus</div>
              <div class="cert-header">${certTitle}</div>
              <div class="cert-body">
                ${certText}
              </div>
            </div>

            <div class="footer-grid">
              <div>
                <p style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Date of Issue: <strong>${issueDate}</strong></p>
                <div class="signature">Office Seal</div>
              </div>
              <div>
                <div class="signature">Principal Signature</div>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Official Certificates</h1>
        <p className="text-slate-500 mt-1">Generate and print official bonafide and character certificates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificate Generator Controls */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileBadge className="w-5 h-5 text-indigo-600" /> Select Certificate
          </h2>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Certificate Document</label>
            <select value={certType} onChange={e => setCertType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 outline-none text-sm">
              <option value="Bonafide">Bonafide Certificate</option>
              <option value="Character">Character & Conduct Certificate</option>
              <option value="Fee">Fee Clearance Certificate</option>
            </select>
          </div>

          <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-800 space-y-1">
            <p className="font-bold flex items-center gap-1"><Award className="w-4 h-4 text-indigo-600" /> Live Verification</p>
            <p>Generates an official document pre-filled with your verified student admission credentials.</p>
          </div>

          <Button onClick={handlePrintCertificate} className="w-full flex items-center justify-center gap-2 py-3">
            <Printer className="w-4 h-4" /> Print / Download PDF
          </Button>
        </motion.div>

        {/* Live Certificate Preview Box */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 relative overflow-hidden flex flex-col justify-between">
          <div className="border-4 border-double border-indigo-200 p-6 rounded-xl bg-slate-50/50 relative">
            <div className="flex justify-between items-center border-b border-indigo-100 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <School className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="font-extrabold text-indigo-950 text-base uppercase tracking-wider">EduERP International Academy</h3>
                  <p className="text-[11px] text-slate-500">Official Student Academic Record</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg uppercase">
                {certType}
              </span>
            </div>

            <div className="space-y-4 text-slate-700 text-sm leading-relaxed my-6">
              <p>
                This is to certify that <strong className="text-slate-900">{user?.name || 'Student'}</strong>, Son/Daughter of <strong className="text-slate-900">{profile?.fatherName || 'Guardian'}</strong>, bearing Roll No. <strong className="font-mono text-indigo-600">{profile?.rollNumber || '101'}</strong> and Admission No. <strong className="font-mono text-indigo-600">{profile?.admissionNumber || 'ADM-2026-001'}</strong>, is a registered student in <strong className="text-slate-900">Class {profile?.enrolledClass?.name || '1'} - Section {profile?.enrolledClass?.section || 'A'}</strong>.
              </p>
            </div>

            <div className="flex justify-between items-end border-t border-indigo-100 pt-6 mt-8 text-xs text-slate-500">
              <div>
                <span>Issue Date: <strong>{new Date().toLocaleDateString()}</strong></span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-700">Principal Signature</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
