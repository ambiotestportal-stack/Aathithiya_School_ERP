"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { User, Phone, MapPin, Calendar, Mail, BookOpen, Users } from 'lucide-react';

export default function StudentProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/api/students/me?userId=${user?.id}`);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchProfile();
  }, [user]);

  if (loading) return <div className="py-12 text-center text-slate-500">Loading profile...</div>;
  if (!profile) return <div className="py-12 text-center text-red-500">Profile data not found.</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="px-8 pb-8 relative">
          <div className="w-24 h-24 bg-white rounded-2xl p-2 shadow-lg absolute -top-12 flex items-center justify-center border border-slate-100">
            <User className="w-12 h-12 text-slate-400" />
          </div>
          
          <div className="pt-16">
            <h2 className="text-2xl font-bold text-slate-900">{profile.user?.name}</h2>
            <p className="text-blue-600 font-medium">Student • Admission No: {profile.admissionNumber}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Academic Details</h3>
              
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Class & Section</p>
                  <p className="font-medium text-slate-900">{profile.enrolledClass?.name} - {profile.enrolledClass?.section}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Date of Admission</p>
                  <p className="font-medium text-slate-900">
                    {profile.createdAt || profile.admissionDate ? new Date(profile.admissionDate || profile.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Personal Details</h3>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Date of Birth</p>
                  <p className="font-medium text-slate-900">
                    {profile.dob || profile.dateOfBirth ? new Date(profile.dob || profile.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Gender & Blood Group</p>
                  <p className="font-medium text-slate-900">{profile.gender || 'N/A'} {profile.bloodGroup ? `• ${profile.bloodGroup}` : ''}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Address</p>
                  <p className="font-medium text-slate-900">{profile.address || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Contact / Parent Phone</p>
                  <p className="font-medium text-slate-900">{profile.contactNumber || profile.emergencyContact || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
