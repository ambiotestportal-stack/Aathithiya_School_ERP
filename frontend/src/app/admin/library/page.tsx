"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { LibraryModal } from '@/components/organisms/LibraryModal';
import { Plus, Trash2, Book, Search, Library as LibIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';

export default function LibraryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/library');
      setBooks(res.data);
    } catch (error) {
      console.error('Failed to fetch books', error);
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/library/${id}`);
      fetchBooks();
      toast.success('Book deleted successfully');
    } catch (error) {
      toast.error('Failed to delete book');
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const filteredBooks = books.filter(b => 
    (b.title || '').toLowerCase().includes(search.toLowerCase()) || 
    (b.author || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.isbn || '').includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Library Management</h1>
          <p className="text-slate-500 mt-1">Catalog books and monitor availability.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-5 h-5" /> Add Book
        </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search books by title, author, or ISBN..." 
          className="flex-1 outline-none text-slate-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Book Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Availability</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading books...</td></tr> : 
               filteredBooks.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <LibIcon className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-lg font-medium text-slate-900">No books found</p>
                  </div>
                </td></tr>
              ) : (
                filteredBooks.map((book, i) => (
                  <motion.tr key={book._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                          <Book className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{book.title}</div>
                          <div className="text-sm text-slate-500">by {book.author} | ISBN: {book.isbn}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">{book.category}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`text-xl font-bold ${book.availableCopies > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {book.availableCopies} <span className="text-sm font-medium text-slate-400">/ {book.totalCopies}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{book.availableCopies > 0 ? 'Available' : 'Out of Stock'}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button aria-label="Delete book" onClick={() => setDeleteConfirm({ open: true, id: book._id })} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <LibraryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchBooks} />

      <ConfirmDialog
        isOpen={deleteConfirm.open}
        title="Delete Book"
        message="Are you sure you want to delete this book?"
        onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  );
}
