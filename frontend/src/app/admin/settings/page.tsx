"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/atoms/Button';
import { Settings, Shield, Bell, CreditCard, Save, BookOpen, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Toggle = ({ label, description, checked, onChange }: any) => {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
      <div>
        <h4 className="font-bold text-slate-800">{label}</h4>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <button 
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-indigo-500' : 'bg-slate-300'}`}
      >
        <motion.div 
          layout
          className="w-4 h-4 bg-white rounded-full shadow-sm"
          animate={{ x: checked ? 24 : 0 }}
        />
      </button>
    </div>
  );
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    showTimetableToStudents: true,
    showTimetableToStaff: true,
    periodStructures: []
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/api/settings');
        if (res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/settings', settings);
      alert('Settings updated successfully!');
    } catch (err) {
      alert('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 mt-1">Configure global application behaviors and integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Existing mock sections */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2 bg-indigo-50/50">
            <Bell className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-800">Notifications</h2>
          </div>
          <div className="p-5 space-y-3">
            <Toggle label="SMS Alerts" description="Send SMS for attendance and fees." checked={settings.smsAlerts !== false} onChange={(v: boolean) => updateSetting('smsAlerts', v)} />
            <Toggle label="Email Summaries" description="Weekly academic summaries for parents." checked={settings.emailSummaries !== false} onChange={(v: boolean) => updateSetting('emailSummaries', v)} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2 bg-emerald-50/50">
            <Shield className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-800">Security & Privacy</h2>
          </div>
          <div className="p-5 space-y-3">
            <Toggle label="Two-Factor Auth" description="Require 2FA for staff and admins." checked={settings.twoFactorAuth === true} onChange={(v: boolean) => updateSetting('twoFactorAuth', v)} />
            <Toggle label="Hide Contact Info" description="Hide teacher phone numbers." checked={settings.hideContactInfo === true} onChange={(v: boolean) => updateSetting('hideContactInfo', v)} />
          </div>
        </motion.div>
      </div>
      
      <div className="flex justify-end pt-4 sticky bottom-6 z-10">
        <Button onClick={handleSave} className="flex items-center gap-2 px-8 shadow-lg shadow-indigo-200" disabled={saving}>
          <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
