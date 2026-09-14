"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/atoms/Button';
import { Book, CheckCircle, Clock, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/atoms/Input';

const IssueBookModal = ({ isOpen, onClose, onSuccess, books, students }: any) => {
  const [formData, setFormData] = useState({ bookId: '', studentId: '', dueDate: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/library/issues', formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative z-10 overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between bg-slate-50">
              <h3 className="text-xl font-bold">Issue Book</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-6">
              <form id="issue-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Select Book</label>
                  <select value={formData.bookId} onChange={e => setFormData({...formData, bookId: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 outline-none" required>
                    <option value="">-- Choose Book --</option>
                    {books.filter((b: any) => b.availableCopies > 0).map((b: any) => (
                      <option key={b._id} value={b._id}>{b.title} ({b.availableCopies} available)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Select Student</label>
                  <select value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 outline-none" required>
                    <option value="">-- Choose Student --</option>
                    {students.map((s: any) => (
                      <option key={s._id} value={s._id}>{s.user?.name} - {s.admissionNumber}</option>
                    ))}
                  </select>
                </div>
                <Input label="Due Date" id="dueDate" type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} required />
              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button form="issue-form" type="submit" disabled={loading}>{loading ? 'Issuing...' : 'Issue Book'}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function AdminLibraryIssuesPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [issuesRes, booksRes, studentsRes] = await Promise.all([
        api.get('/api/library/issues'),
        api.get('/api/library'),
        api.get('/api/students')
      ]);
      setIssues(issuesRes.data);
      setBooks(booksRes.data);
      setStudents(studentsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReturn = async (issueId: string) => {
    if (confirm('Mark this book as returned?')) {
      try {
        await api.put(`/api/library/issues/${issueId}/return`);
        fetchData();
      } catch (err) {
        alert('Failed to return book');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Library Issuance</h1>
          <p className="text-slate-500 mt-1">Track books issued to students and manage returns.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Issue Book</Button>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Book Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Issued To</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Timeline</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading records...</td></tr>
              ) : issues.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-500">No books currently issued.</td></tr>
              ) : (
                issues.map((issue) => {
                  const isOverdue = new Date(issue.dueDate) < new Date() && issue.status !== 'Returned';
                  
                  return (
                    <tr key={issue._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{issue.book?.title}</div>
                        <div className="text-sm text-slate-500">ISBN: {issue.book?.isbn}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{issue.student?.user?.name}</div>
                        <div className="text-xs text-slate-500 mt-1">Class {issue.student?.enrolledClass?.name} - {issue.student?.enrolledClass?.section}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="text-slate-600"><span className="font-medium">Issued:</span> {new Date(issue.issueDate).toLocaleDateString()}</div>
                        <div className={`${isOverdue ? 'text-red-600 font-bold' : 'text-slate-600'}`}><span className="font-medium">Due:</span> {new Date(issue.dueDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold flex w-fit items-center gap-1.5 ${
                          issue.status === 'Returned' ? 'bg-emerald-100 text-emerald-700' :
                          isOverdue ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {issue.status === 'Returned' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {issue.status === 'Returned' ? 'Returned' : isOverdue ? 'Overdue' : 'Issued'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {issue.status !== 'Returned' && (
                          <Button variant="secondary" onClick={() => handleReturn(issue._id)} className="text-xs py-1.5 px-3">Mark Returned</Button>
                        )}
                        {issue.status === 'Returned' && (
                          <span className="text-xs text-slate-400 font-medium">Returned on {new Date(issue.returnDate).toLocaleDateString()}</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <IssueBookModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchData} books={books} students={students} />
    </div>
  );
}
