"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Lock, Save, User, Briefcase, Mail, Phone, MapPin, Calendar, Award, BookOpen, Layers } from 'lucide-react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';

export default function TeacherProfilePage() {
  const user = useAuthStore(state => state.user);
  const [staffProfile, setStaffProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loadingPass, setLoadingPass] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await api.get('/api/staff');
        const myProfile = res.data.find((s: any) => s.user?._id === user?.id || s.user === user?.id);
        if (myProfile) {
          setStaffProfile(myProfile);
        } else if (res.data.length > 0) {
          setStaffProfile(res.data[0]); // Fallback if mock user
        }
      } catch (err) {
        console.error('Failed to fetch staff profile', err);
      } finally {
        setLoadingProfile(false);
      }
    };
    if (user?.id) fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.id]: e.target.value });
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    
    setLoadingPass(true);
    setMessage({ type: '', text: '' });
    
    try {
      await api.put(`/api/users/${user?.id}`, { 
        password: passwords.newPassword 
      });
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswords({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update password' });
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Profile & Settings</h1>
        <p className="text-slate-500 mt-1">View your professional details and manage account credentials.</p>
      </div>

      {/* Staff Details Banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-start">
          <span className="px-3 py-1 bg-white/20 text-white backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider">
            {staffProfile?.designation || 'Teacher'}
          </span>
          <span className="text-xs text-blue-100 font-mono">
            ID: {staffProfile?.employeeId || 'N/A'}
          </span>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-10 mb-6">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-md p-1 border border-slate-100 flex items-center justify-center">
                <div className="w-full h-full bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-2xl">
                  {(user?.name || staffProfile?.user?.name || 'T').charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{user?.name || staffProfile?.user?.name || 'Staff Member'}</h2>
                <p className="text-sm font-semibold text-indigo-600 flex items-center gap-1">
                  <BookOpen className="w-4 h-4" /> Teaching Subject: {staffProfile?.department || 'General'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            {/* Professional Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Professional Information</h3>
              
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500">Employee ID:</span>
                <strong className="text-slate-800 font-mono">{staffProfile?.employeeId || 'N/A'}</strong>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Award className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500">Qualification:</span>
                <strong className="text-slate-800">{staffProfile?.qualification || 'Not Specified'}</strong>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500">Joining Date:</span>
                <strong className="text-slate-800">
                  {staffProfile?.joiningDate ? new Date(staffProfile.joiningDate).toLocaleDateString() : 'N/A'}
                </strong>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500">Experience:</span>
                <strong className="text-slate-800">{staffProfile?.experienceYears || 0} Years</strong>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact & Account</h3>

              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500">Email Address:</span>
                <strong className="text-slate-800">{user?.email || staffProfile?.user?.email || 'N/A'}</strong>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500">Phone Number:</span>
                <strong className="text-slate-800">{staffProfile?.phone || 'N/A'}</strong>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-500">Address:</span>
                <strong className="text-slate-800">{staffProfile?.address || 'N/A'}</strong>
              </div>
            </div>
          </div>

          {/* Assigned Classes */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-500" /> Assigned Classes & Sections Taught
            </h3>
            {staffProfile?.assignedClasses && staffProfile.assignedClasses.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {staffProfile.assignedClasses.map((c: any) => (
                  <span key={c._id || c} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold rounded-xl">
                    {c.name ? `${c.name.toLowerCase().startsWith('class') ? c.name : `Class ${c.name}`} - Sec ${c.section}` : 'Assigned Class'}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No classes currently assigned.</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Change Password Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600" /> Change Security Password
        </h2>
        
        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm ${
            message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
          <Input 
            label="New Password" 
            id="newPassword" 
            type="password" 
            value={passwords.newPassword} 
            onChange={handleChange} 
            required 
          />
          <Input 
            label="Confirm New Password" 
            id="confirmPassword" 
            type="password" 
            value={passwords.confirmPassword} 
            onChange={handleChange} 
            required 
          />
          
          <div className="pt-2">
            <Button type="submit" disabled={loadingPass} className="w-full sm:w-auto flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> {loadingPass ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
