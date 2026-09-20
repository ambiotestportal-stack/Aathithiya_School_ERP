"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Building2, Save, MapPin, Phone, Globe, Upload, CheckCircle, Trash2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';

export default function SchoolProfilePage() {
  const [formData, setFormData] = useState({
    schoolName: '',
    logoUrl: '',
    estYear: '',
    principalName: '',
    affiliationNo: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    zipCode: ''
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/api/settings').then(res => {
      if (res.data) {
        setFormData({
          schoolName: res.data.schoolName || 'EduERP International Academy',
          logoUrl: res.data.logoUrl || '',
          estYear: res.data.estYear || '2005',
          principalName: res.data.principalName || 'Dr. Robert Oppenheimer',
          affiliationNo: res.data.affiliationNo || 'CBSE/AFF/123456',
          phone: res.data.phone || '+1 (555) 123-4567',
          email: res.data.email || 'admin@school.edu',
          website: res.data.website || 'www.school.edu',
          address: res.data.address || '123 Innovation Drive, Tech Park',
          city: res.data.city || 'Metropolis',
          zipCode: res.data.zipCode || '10001'
        });
      }
    }).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setFormData((prev) => ({ ...prev, logoUrl: base64Url }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/api/settings', formData);
      setMessage('School profile saved successfully!');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('school-settings-updated'));
      }
    } catch (err: any) {
      alert('Failed to save school profile');
    } finally {

      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">School Profile</h1>
        <p className="text-slate-500 mt-1">Manage global school information, logo, and academic settings.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-slate-800">Basic Information</h2>
          </div>
          {message && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> {message}
            </span>
          )}
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />

            {/* Interactive Logo Container */}
            <div className="flex flex-col items-center gap-2">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-36 h-36 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center shrink-0 relative overflow-hidden group cursor-pointer hover:border-blue-500 transition-all shadow-inner"
              >
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="School Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 p-2 text-center">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="font-bold text-xs uppercase">Upload Logo</span>
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-slate-900/60 hidden group-hover:flex flex-col items-center justify-center transition-all gap-1 text-white text-xs font-bold">
                  <Upload className="w-5 h-5 mb-0.5" />
                  <span>{formData.logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                </div>
              </div>

              {formData.logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Logo
                </button>
              )}
            </div>
            
            <div className="flex-1 w-full space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="School Name" id="schoolName" value={formData.schoolName} onChange={handleChange} required />
                <Input label="Establishment Year" id="estYear" value={formData.estYear} onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Principal Name" id="principalName" value={formData.principalName} onChange={handleChange} required />
                <Input label="Affiliation Number" id="affiliationNo" value={formData.affiliationNo} onChange={handleChange} required />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-700 flex items-center gap-2"><Phone className="w-4 h-4"/> Contact Details</h3>
              <Input label="Primary Phone" id="phone" value={formData.phone} onChange={handleChange} required />
              <Input label="Email Address" id="email" type="email" value={formData.email} onChange={handleChange} required />
              <Input label="Website" id="website" value={formData.website} onChange={handleChange} />
            </div>
            
            <div className="space-y-4">
              <h3 className="font-bold text-slate-700 flex items-center gap-2"><MapPin className="w-4 h-4"/> Address</h3>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">Street Address</label>
                <textarea id="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm" rows={3} required></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" id="city" value={formData.city} onChange={handleChange} required />
                <Input label="Zip Code" id="zipCode" value={formData.zipCode} onChange={handleChange} required />
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <Button type="submit" className="flex items-center gap-2 px-8" disabled={saving}>
              <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
