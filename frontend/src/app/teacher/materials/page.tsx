"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, FileText, Video, File, Download, ExternalLink, X, BookOpen, Upload, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

const MaterialModal = ({ isOpen, onClose, onSuccess, classes, subjects }: any) => {
  const { user } = useAuthStore();
  const [uploadSource, setUploadSource] = useState<'file' | 'link'>('file');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [formData, setFormData] = useState({
    title: '', description: '', enrolledClass: '', subject: '', fileType: 'pdf', fileUrl: ''
  });
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    
    // Auto-detect format type
    let type: 'pdf' | 'word' | 'video' | 'other' = 'other';
    const nameLower = file.name.toLowerCase();
    if (file.type.includes('pdf') || nameLower.endsWith('.pdf')) type = 'pdf';
    else if (file.type.includes('word') || nameLower.endsWith('.doc') || nameLower.endsWith('.docx')) type = 'word';
    else if (file.type.includes('video') || nameLower.endsWith('.mp4') || nameLower.endsWith('.mkv') || nameLower.endsWith('.mov')) type = 'video';

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        fileUrl: reader.result as string,
        fileType: type,
        title: prev.title || file.name.replace(/\.[^/.]+$/, "")
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fileUrl) {
      alert('Please upload a file or provide a valid link');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        subject: formData.subject || undefined,
        uploadedBy: user?.id
      };
      await api.post('/api/study-materials', payload);
      onSuccess();
      onClose();
      setFormData({ title: '', description: '', enrolledClass: '', subject: '', fileType: 'pdf', fileUrl: '' });
      setSelectedFileName('');
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to save study material');
    } finally {
      setLoading(false);
    }
  };

  const formatClassName = (c: any) => {
    if (!c) return '';
    const name = c.name || '';
    const section = c.section || '';
    if (name.toLowerCase().startsWith('class') || name.toLowerCase().startsWith('grade')) {
      return `${name} - Section ${section}`;
    }
    return `Class ${name} - Section ${section}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative z-10 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold">Add Study Material</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-6">
              <form id="material-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Upload Source Toggle */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">Material Source</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setUploadSource('file')}
                      className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${uploadSource === 'file' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Upload className="w-4 h-4" /> Upload File (PDF/Doc/Video)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadSource('link')}
                      className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${uploadSource === 'link' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <LinkIcon className="w-4 h-4" /> Web URL / Video Link
                    </button>
                  </div>
                </div>

                {/* File Upload Component */}
                {uploadSource === 'file' ? (
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Choose File</label>
                    <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 rounded-2xl p-4 text-center cursor-pointer transition-colors group">
                      <input 
                        type="file" 
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.avi,video/*,application/pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="w-8 h-8 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                        {selectedFileName ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="truncate max-w-[250px]">{selectedFileName}</span>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs font-bold text-slate-700">Click to browse or drag file here</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Supports PDF, Word Documents & Videos</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1.5">Material Format</label>
                      <select value={formData.fileType} onChange={e => setFormData({...formData, fileType: e.target.value as any})} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 outline-none" required>
                        <option value="pdf">PDF Document (.pdf)</option>
                        <option value="word">Word Document (.docx)</option>
                        <option value="video">Video Link / Embed</option>
                        <option value="other">Other Link</option>
                      </select>
                    </div>
                    <Input label="File URL / Link" id="fileUrl" value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} required placeholder="https://..." />
                  </div>
                )}

                <Input label="Material Title" id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="e.g. Chapter 1 Notes" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Class Taught</label>
                    <select value={formData.enrolledClass} onChange={e => setFormData({...formData, enrolledClass: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 outline-none" required>
                      <option value="">-- Select Class --</option>
                      {classes.map((c: any) => <option key={c._id} value={c._id}>{formatClassName(c)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Subject</label>
                    <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 outline-none" required>
                      <option value="">-- Select Subject --</option>
                      {subjects.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">Description (Optional)</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border bg-gray-50 outline-none" rows={2} placeholder="Brief summary of the study material..."></textarea>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50/50 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button form="material-form" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Publish Material'}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function TeacherMaterialsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [materials, setMaterials] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      router.push('/student/materials');
    }
  }, [user, router]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const [matRes, classRes, subRes, staffRes] = await Promise.all([
        api.get('/api/study-materials'),
        api.get('/api/academic/classes'),
        api.get('/api/academic/subjects'),
        api.get('/api/staff')
      ]);
      
      const myMaterials = matRes.data.filter((m: any) => m.uploadedBy?._id === user?.id || m.uploadedBy === user?.id);
      setMaterials(myMaterials);
      
      const myStaffProfile = staffRes.data.find((s: any) => s.user?._id === user?.id || s.user === user?.id);
      const assignedClassIds = (myStaffProfile?.assignedClasses || []).map((c: any) => c._id || c);

      const myClasses = classRes.data.filter((c: any) => 
        c.classTeacher?._id === user?.id || 
        c.classTeacher === user?.id ||
        assignedClassIds.includes(c._id)
      );

      setClasses(myClasses.length > 0 ? myClasses : classRes.data);
      setSubjects(subRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchMaterials();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this study material?')) {
      await api.delete(`/api/study-materials/${id}`);
      fetchMaterials();
    }
  };

  const getFormatIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'word': return <File className="w-5 h-5 text-blue-500" />;
      case 'video': return <Video className="w-5 h-5 text-purple-500" />;
      default: return <BookOpen className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Study Materials</h1>
          <p className="text-slate-500 mt-1">Upload and share learning resources for your assigned classes.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-5 h-5" /> Add Material
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading materials...</div>
        ) : materials.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p>You haven't uploaded any study materials yet.</p>
          </div>
        ) : (
          materials.map((mat, i) => (
            <motion.div key={mat._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white shadow-sm border border-slate-200 rounded-2xl p-5 flex flex-col justify-between group relative hover:shadow-md transition-all">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 rounded-xl">{getFormatIcon(mat.fileType)}</div>
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs uppercase rounded-lg">
                      {mat.fileType}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(mat._id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">{mat.title}</h3>
                {mat.description && <p className="text-xs text-slate-500 mb-4 line-clamp-2">{mat.description}</p>}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Class {mat.enrolledClass?.name} - {mat.enrolledClass?.section}</span>
                  <span className="text-indigo-600 font-bold">{mat.subject?.name}</span>
                </div>

                <a
                  href={mat.fileUrl}
                  target="_blank"
                  download
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
                >
                  {mat.fileType === 'video' ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  {mat.fileType === 'video' ? 'Watch Video' : 'View / Download'}
                </a>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <MaterialModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchMaterials} classes={classes} subjects={subjects} />
    </div>
  );
}
