"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Download } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function CircularPage() {
  const [circulars, setCirculars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentCircular, setCurrentCircular] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  // fileUrl can be implemented if there's an upload endpoint. 
  // For now we just mock or use string.

  const fetchCirculars = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/circulars');
      setCirculars(res.data);
    } catch (error) {
      console.error('Failed to fetch circulars', error);
      toast.error('Failed to load circulars');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCirculars();
  }, []);

  const handleAddNew = () => {
    setCurrentCircular(null);
    setTitle('');
    setPublishDate('');
    setDescription('');
    setTargetAudience('all');
    setIsEditing(true);
  };

  const handleEdit = (circular: any) => {
    setCurrentCircular(circular);
    setTitle(circular.title);
    setPublishDate(circular.publishDate);
    setDescription(circular.description);
    setTargetAudience(circular.targetAudience || 'all');
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this circular?')) return;
    try {
      await api.delete(`/api/circulars/${id}`);
      toast.success('Circular deleted successfully');
      fetchCirculars();
    } catch (error) {
      toast.error('Failed to delete circular');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title, publishDate, description, targetAudience };
    
    try {
      if (currentCircular) {
        await api.put(`/api/circulars/${currentCircular._id}`, payload);
        toast.success('Circular updated successfully');
      } else {
        await api.post('/api/circulars', payload);
        toast.success('Circular added successfully');
      }
      setIsEditing(false);
      fetchCirculars();
    } catch (err) {
      toast.error('Failed to save circular');
    }
  };

  if (isEditing) {
    return (
      <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          {currentCircular ? 'Edit Circular' : 'Add Circular'}
        </h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-[#9352F3] px-6 py-4">
            <h2 className="text-white font-semibold">
              {currentCircular ? 'Edit Circular' : 'Add Circular'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-purple-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Publish Date</label>
                <input 
                  type="date" 
                  value={publishDate}
                  onChange={e => setPublishDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-purple-500" 
                  required 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Target Audience</label>
              <select
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-purple-500"
                required
              >
                <option value="all">All (Staff, Students, Parents)</option>
                <option value="staff">Staff Only</option>
                <option value="student">Students Only</option>
                <option value="parent">Parents Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Description</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-sm h-32 resize-none focus:outline-none focus:border-purple-500" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Upload File (PDF/Doc)</label>
              <div className="border border-slate-200 rounded-lg p-3 flex items-center">
                <input type="file" className="text-sm" />
              </div>
              {currentCircular?.fileUrl && (
                <p className="text-xs text-slate-500 mt-2">Current File: {currentCircular.fileUrl}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-[#9352F3] text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
              >
                {currentCircular ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Circular Management</h1>
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#9352F3] text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Circular
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-[#9352F3] px-6 py-4">
          <h2 className="text-white font-semibold">Circular List</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#9352F3] text-white border-t border-purple-400">
              <tr>
                <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">ID</th>
                <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">TITLE</th>
                <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">AUDIENCE</th>
                <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">PUBLISH DATE</th>
                <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">DESCRIPTION</th>
                <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">FILE</th>
                <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading circulars...
                  </td>
                </tr>
              ) : circulars.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No circulars found.
                  </td>
                </tr>
              ) : (
                circulars.map((circular, index) => (
                  <tr key={circular._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-600">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{circular.title}</td>
                    <td className="px-6 py-4 text-slate-600 capitalize">{circular.targetAudience || 'all'}</td>
                    <td className="px-6 py-4 text-slate-600">{circular.publishDate}</td>
                    <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{circular.description}</td>
                    <td className="px-6 py-4">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-400 text-white rounded text-xs hover:bg-blue-500 transition-colors">
                        <Download className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(circular)}
                          className="p-1.5 bg-[#9352F3] text-white rounded hover:bg-purple-600 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(circular._id)}
                          className="p-1.5 bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
