"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Download, ExternalLink, FileText, Video, File, Search, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentMaterialsPage() {
  const { user } = useAuthStore();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const studentProfileRes = await api.get(`/api/students/me?userId=${user?.id}`);
        const classId = studentProfileRes.data?.enrolledClass?._id || studentProfileRes.data?.enrolledClass;

        if (classId) {
          const res = await api.get(`/api/study-materials?classId=${classId}`);
          setMaterials(res.data);
        } else {
          const res = await api.get('/api/study-materials');
          setMaterials(res.data);
        }
      } catch (err) {
        console.error(err);
        try {
          const res = await api.get('/api/study-materials');
          setMaterials(res.data);
        } catch (e) {
          console.error(e);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchMaterials();
  }, [user]);

  const getFormatIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-6 h-6 text-red-500" />;
      case 'word': return <File className="w-6 h-6 text-blue-500" />;
      case 'video': return <Video className="w-6 h-6 text-purple-500" />;
      default: return <BookOpen className="w-6 h-6 text-slate-500" />;
    }
  };

  const filtered = materials.filter(m => 
    m.title?.toLowerCase().includes(search.toLowerCase()) || 
    m.subject?.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Study Materials</h1>
        <p className="text-slate-500 mt-1">Access notes, documents, and videos uploaded by your class teachers.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search materials by title or subject..." 
          className="flex-1 outline-none text-slate-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading study materials...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p>No study materials uploaded for your class yet.</p>
          </div>
        ) : (
          filtered.map((mat, i) => (
            <motion.div key={mat._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      {getFormatIcon(mat.fileType)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{mat.title}</h3>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-bold text-indigo-600">{mat.subject?.name || 'General'}</span>
                        <span>•</span>
                        <span>{mat.uploadedBy?.name || 'Teacher'}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold text-xs uppercase rounded-lg">
                    {mat.fileType}
                  </span>
                </div>

                {mat.description && (
                  <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 line-clamp-2">
                    {mat.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[11px] text-slate-400">
                  Uploaded {new Date(mat.createdAt).toLocaleDateString()}
                </span>
                <a
                  href={mat.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                >
                  {mat.fileType === 'video' ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  {mat.fileType === 'video' ? 'Watch Video' : 'Download File'}
                </a>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
