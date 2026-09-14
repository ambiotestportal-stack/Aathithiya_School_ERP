"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { StaffModal } from '@/components/organisms/StaffModal';
import { AssignClassesModal } from '@/components/organisms/AssignClassesModal';
import { ImportModal } from '@/components/organisms/ImportModal';
import { Plus, Trash2, Briefcase, Search, Phone, Mail, Edit, Eye, BookOpen, Layers, Upload, FileSpreadsheet, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';
import { TableSkeleton } from '@/components/molecules/Skeletons';

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'directory' | 'assignments'>('directory');
  
  // Full Staff Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  // Dedicated Assign Classes Modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignStaffMember, setAssignStaffMember] = useState<any>(null);

  // Confirm states
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null; isBulk: boolean }>({ open: false, id: null, isBulk: false });

  const [search, setSearch] = useState('');

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/staff');
      setStaff(res.data);
    } catch (error) {
      console.error('Failed to fetch staff', error);
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/staff/${id}`);
      fetchStaff();
      toast.success('Staff member deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleteConfirm({ open: false, id: null, isBulk: false });
    }
  };

  const handleOpenModal = (mode: 'add' | 'edit' | 'view', member: any = null) => {
    setModalMode(mode);
    setSelectedStaff(member);
    setIsModalOpen(true);
  };

  const handleOpenAssignModal = (member: any) => {
    setAssignStaffMember(member);
    setIsAssignModalOpen(true);
  };

  const filteredStaff = staff.filter(s => {
    const q = search.toLowerCase();
    const nameMatch = s.user?.name?.toLowerCase().includes(q);
    const empIdMatch = s.employeeId?.toLowerCase().includes(q);
    const deptMatch = s.department?.toLowerCase().includes(q);
    const assignedMatch = (s.assignedClasses || []).some((c: any) => {
      const clsName = c.name ? `class ${c.name} - ${c.section}`.toLowerCase() : '';
      return clsName.includes(q);
    });
    return nameMatch || empIdMatch || deptMatch || assignedMatch;
  });

  const getExportData = () => {
    const headers = [
      'Employee Name', 'Employee ID', 'Subject/Department', 'Designation', 
      'Email', 'Phone', 'Qualification', 'Experience (Yrs)', 'Salary ($)', 'Joining Date', 'Classes Taught'
    ];

    const rows = filteredStaff.map(s => {
      const assigned = (s.assignedClasses || [])
        .map((c: any) => c.name ? `Class ${c.name}-${c.section}` : '')
        .filter(Boolean)
        .join('; ');

      return [
        s.user?.name || '',
        s.employeeId || '',
        s.department || '',
        s.designation || '',
        s.user?.email || '',
        s.phone || '',
        s.qualification || '',
        s.experienceYears || 0,
        s.salary || 0,
        s.joiningDate ? new Date(s.joiningDate).toLocaleDateString() : '',
        assigned || 'None'
      ];
    });

    return { headers, rows };
  };

  const handleExportExcel = () => {
    const { headers, rows } = getExportData();
    exportToExcel('Staff Directory', headers, rows);
  };

  const handleExportPDF = () => {
    const { headers, rows } = getExportData();
    exportToPDF(
      'Staff Directory Report',
      'Complete list of school faculty, departments, credentials, and assigned class sections',
      headers,
      rows
    );
  };

  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

  const handleToggleSelectAll = () => {
    if (selectedStaffIds.length === filteredStaff.length) {
      setSelectedStaffIds([]);
    } else {
      setSelectedStaffIds(filteredStaff.map(s => s._id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedStaffIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedStaffIds.length === 0) return;
    try {
      await Promise.all(selectedStaffIds.map(id => api.delete(`/api/staff/${id}`)));
      setSelectedStaffIds([]);
      fetchStaff();
      toast.success('Selected staff members deleted successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete selected staff members');
    } finally {
      setDeleteConfirm({ open: false, id: null, isBulk: false });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Staff Management</h1>
          <p className="text-slate-500 mt-1">Manage teachers, their subjects (matched by ID), and assigned classes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button variant="secondary" onClick={handleExportExcel} className="flex items-center gap-1.5 text-xs py-2 px-3">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
          </Button>
          <Button variant="secondary" onClick={handleExportPDF} className="flex items-center gap-1.5 text-xs py-2 px-3">
            <FileText className="w-4 h-4 text-red-600" /> Export PDF
          </Button>
          <Button variant="secondary" onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-1.5 text-xs py-2 px-3">
            <Upload className="w-4 h-4 text-indigo-600" /> Import CSV
          </Button>
          <Button onClick={() => handleOpenModal('add')} className="text-xs py-2 px-3">
            <Plus className="w-4 h-4" /> Add Staff Member
          </Button>
        </div>
      </div>

      {/* Tabs Layout & Selection Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 gap-4">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('directory')}
            className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'directory' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Briefcase className="w-4 h-4" /> Staff Directory
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'assignments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Layers className="w-4 h-4" /> Class & Section Assignments
          </button>
        </div>

        {selectedStaffIds.length > 0 && (
          <div className="flex items-center gap-2 pb-2">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              {selectedStaffIds.length} Selected
            </span>
            <Button variant="secondary" onClick={() => setSelectedStaffIds([])} className="text-xs py-1 px-2.5">
              Clear
            </Button>
            <Button variant="danger" onClick={() => setDeleteConfirm({ open: true, id: null, isBulk: true })} className="text-xs py-1 px-2.5 flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search staff by name, employee ID, subject, or class (e.g. Class 8-A)..." 
          className="flex-1 outline-none text-slate-700 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {activeTab === 'directory' ? (
        loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : (
          /* Staff Directory Table */
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-4 py-4 text-left w-10">
                      <input 
                        type="checkbox"
                        checked={filteredStaff.length > 0 && selectedStaffIds.length === filteredStaff.length}
                        onChange={handleToggleSelectAll}
                        title="Select all staff members"
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Employee Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Subject & Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Contact Info</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Classes Taught</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredStaff.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Briefcase className="w-12 h-12 text-slate-300 mb-3" />
                        <p className="text-lg font-medium text-slate-900">No staff members found</p>
                      </div>
                    </td></tr>
                  ) : (
                    filteredStaff.map((member, i) => {
                      const isSelected = selectedStaffIds.includes(member._id);
                      return (
                        <motion.tr key={member._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className={`hover:bg-slate-50/50 ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                          <td className="px-4 py-4">
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOne(member._id)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                                {member.user?.name?.charAt(0).toUpperCase() || 'S'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-bold text-slate-900">{member.user?.name}</div>
                                <div className="text-xs text-slate-500 font-mono">ID: {member.employeeId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-indigo-600 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" /> 
                              <span>{member.subject?.name || member.department || 'General'}</span>
                              {member.subject?.code && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                                  {member.subject.code}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-medium">{member.designation || 'Teacher'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-slate-700 flex items-center gap-1.5 font-medium">
                              <Mail className="w-3.5 h-3.5 text-slate-400" /> {member.user?.email || 'No Email'}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400" /> {member.phone || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {member.assignedClasses && member.assignedClasses.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {member.assignedClasses.map((c: any) => (
                                  <span key={c._id || c} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[11px] font-bold">
                                    {c.name ? `Class ${c.name}-${c.section}` : 'Class'}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No assigned classes</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleOpenAssignModal(member)} title="Quick Assign Classes" className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors font-bold text-xs flex items-center gap-1">
                                <Layers className="w-4 h-4" /> Assign
                              </button>
                              <button aria-label="View staff member" onClick={() => handleOpenModal('view', member)} className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                              <button aria-label="Edit staff member" onClick={() => handleOpenModal('edit', member)} className="text-slate-400 hover:text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                              <button aria-label="Delete staff member" onClick={() => setDeleteConfirm({ open: true, id: member._id, isBulk: false })} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )
      ) : (
        /* Dedicated Class & Section Assignments Tab View */
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map(member => (
            <div key={member._id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{member.user?.name}</h3>
                    <p className="text-xs text-indigo-600 font-bold flex items-center gap-1.5 mt-0.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {member.subject?.name || member.department || 'General'}
                      {member.subject?.code ? ` (${member.subject.code})` : ''} • ID: {member.employeeId}
                    </p>
                  </div>
                  <Button variant="secondary" onClick={() => handleOpenAssignModal(member)} className="text-xs py-1 px-3 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> Assign
                  </Button>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Classes & Sections</h4>
                    <span className="text-xs font-bold text-indigo-600">
                      {(member.assignedClasses || []).length} assigned
                    </span>
                  </div>
                  {member.assignedClasses && member.assignedClasses.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {member.assignedClasses.map((c: any) => (
                        <span key={c._id || c} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold rounded-lg">
                          {c.name ? `Class ${c.name} - Section ${c.section}` : 'Assigned Class'}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No classes assigned yet. Click "Assign" to select classes.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Full Edit/View Staff Modal */}
      <StaffModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchStaff} 
        mode={modalMode}
        initialData={selectedStaff}
      />

      {/* Dedicated Quick Assign Classes & Sections Modal */}
      <AssignClassesModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={fetchStaff}
        staffMember={assignStaffMember}
      />

      {/* Bulk CSV Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchStaff}
        type="staff"
      />

      <ConfirmDialog
        isOpen={deleteConfirm.open}
        title={deleteConfirm.isBulk ? "Delete Selected Staff" : "Delete Staff Member"}
        message={deleteConfirm.isBulk 
          ? `Are you sure you want to delete ${selectedStaffIds.length} selected staff member(s)?` 
          : "Are you sure you want to delete this staff member? This will also remove their login access."}
        onConfirm={() => deleteConfirm.isBulk ? handleBulkDelete() : (deleteConfirm.id && handleDelete(deleteConfirm.id))}
        onCancel={() => setDeleteConfirm({ open: false, id: null, isBulk: false })}
      />
    </div>
  );
}
