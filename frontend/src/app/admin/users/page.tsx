"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { UserModal } from '@/components/organisms/UserModal';
import { Plus, Trash2, UserCog, Mail, Edit, Eye, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';

import { RolesTab } from '@/components/organisms/RolesTab';

interface User {
  _id: string;
  name: string;
  username: string;
  role: string;
  email?: string;
  createdAt: string;
  customRole?: any;
}

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [customRoles, setCustomRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      const [userRes, roleRes] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/roles')
      ]);
      setUsers(userRes.data);
      setCustomRoles(roleRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/api/users/${id}`);
        fetchUsers();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleOpenModal = (mode: 'add' | 'edit' | 'view', user: any = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const getRoleDisplayName = (user: User) => {
    if (user.role === 'SUPER_ADMIN') return 'Super Admin';
    if (user.role === 'SUB_ADMIN') {
      return user.customRole?.name || 'Custom Role';
    }
    return user.role.replace('_', ' ');
  };

  const getRoleBadge = (role: string) => {
    if (role === 'SUPER_ADMIN') return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  // Only show Admin and Custom Role users in User Management (Students, Teachers, Parents are managed in their dedicated tabs)
  const adminUsers = users.filter(user => user.role === 'SUPER_ADMIN' || user.role === 'SUB_ADMIN');

  const filteredUsers = adminUsers.filter(user => {
    const matchesSearch = 
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.customRole?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    if (roleFilter === '') return matchesSearch;
    if (roleFilter === 'SUPER_ADMIN') return matchesSearch && user.role === 'SUPER_ADMIN';
    const userRoleId = user.customRole?._id || user.customRole;
    return matchesSearch && (userRoleId === roleFilter || user.customRole?.name === roleFilter);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 mt-1">Manage admin accounts, custom roles, and permissions across the ERP.</p>
        </div>
        {activeTab === 'users' && (
          <Button onClick={() => handleOpenModal('add')} className="w-full sm:w-auto">
            <Plus className="w-5 h-5" /> Add Sub-Admin
          </Button>
        )}
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'roles' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Roles & Permissions
        </button>
      </div>

      {activeTab === 'users' ? (<>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by name, username, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="relative w-full sm:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            {customRoles.map(r => (
              <option key={r._id} value={r._id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined Date</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <UserCog className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-lg font-medium text-slate-900">No users found</p>
                      <p>Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={user._id} 
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center border border-slate-300">
                          <span className="font-bold text-slate-600 text-sm">
                            {user.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                            <span className="text-slate-400">@</span>{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getRoleBadge(user.role)} uppercase tracking-wide`}>
                        {getRoleDisplayName(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal('view', user)} className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="View User"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleOpenModal('edit', user)} className="text-slate-400 hover:text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors" title="Edit User"><Edit className="w-4 h-4" /></button>
                        <button 
                          onClick={() => handleDelete(user._id)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchUsers} 
        mode={modalMode}
        initialData={selectedUser}
      />
      </>) : (
        <RolesTab />
      )}
    </div>
  );
}
