"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Package, Box, ArrowRightLeft, XCircle, CheckCircle, Search, Filter, Undo2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import { toast } from 'sonner';

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${d}-${m}-${y} ${hh}:${mm}`;
};

const StockModal = ({ isOpen, onClose, onSuccess, initialData }: any) => {
  const [formData, setFormData] = useState({
    itemCode: '',
    name: '',
    category: '',
    quantity: 0,
    unit: 'Pcs',
    unitPrice: 0,
    vendor: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        itemCode: initialData.itemCode || '',
        name: initialData.name || '',
        category: initialData.category || '',
        quantity: initialData.quantity || 0,
        unit: initialData.unit || 'Pcs',
        unitPrice: initialData.unitPrice || 0,
        vendor: initialData.vendor || '',
        description: initialData.description || ''
      });
    } else {
      setFormData({ itemCode: '', name: '', category: '', quantity: 0, unit: 'Pcs', unitPrice: 0, vendor: '', description: '' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData?._id) {
        await api.put(`/api/stock/${initialData._id}`, formData);
        toast.success('Item Master updated successfully');
      } else {
        await api.post('/api/stock', formData);
        toast.success('Item Master added successfully');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl max-w-md w-full relative z-10 p-6">
            <h3 className="text-xl font-bold mb-4 text-purple-700">{initialData ? 'Edit Item Master' : 'Add Item Master'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-600">Item Code</label>
                  <input type="text" value={formData.itemCode} onChange={e => setFormData({ ...formData, itemCode: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required placeholder="e.g. ID001" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-600">Unit</label>
                  <input type="text" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required placeholder="e.g. Pcs" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-slate-600">Item Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-slate-600">Category</label>
                <input type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-600">Initial Quantity</label>
                  <input type="number" min="0" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-600">Unit Price (₹)</label>
                  <input type="number" min="0" step="0.01" value={formData.unitPrice} onChange={e => setFormData({ ...formData, unitPrice: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-slate-600">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm h-20 resize-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-slate-50" onClick={onClose}>Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-70">{loading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const TransactionModal = ({ isOpen, onClose, onSuccess, type, stocks }: any) => {
  const [selectedStockId, setSelectedStockId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [personName, setPersonName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedStockId('');
      setQuantity('');
      setPersonName('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockId || !quantity) return;
    if ((type === 'issue' || type === 'return') && !personName) {
      toast.error('Please enter the person details.');
      return;
    }

    const stock = stocks.find((s: any) => s._id === selectedStockId);
    if (!stock) return;

    const qtyNum = Number(quantity);
    if (type === 'issue' && qtyNum > stock.quantity) {
      toast.error('Cannot issue more than current stock level.');
      return;
    }
    if (type === 'return' && qtyNum > (stock.issuedQuantity || 0)) {
      toast.error('Cannot return more than what was issued.');
      return;
    }

    setLoading(true);
    try {
      let newQuantity = stock.quantity;
      if (type === 'add') newQuantity += qtyNum;
      if (type === 'issue') newQuantity -= qtyNum;
      if (type === 'return') newQuantity += qtyNum;
      
      const payload: any = { quantity: newQuantity };
      
      if (type === 'issue') {
        payload.issuedQuantity = (stock.issuedQuantity || 0) + qtyNum;
        payload.$push = {
          issueHistory: {
            action: 'issue',
            personName: personName,
            quantity: qtyNum,
            date: new Date()
          }
        };
      } else if (type === 'return') {
        payload.issuedQuantity = (stock.issuedQuantity || 0) - qtyNum;
        payload.$push = {
          issueHistory: {
            action: 'return',
            personName: personName,
            quantity: qtyNum,
            date: new Date()
          }
        };
      }
      
      await api.put(`/api/stock/${selectedStockId}`, payload);
      
      toast.success(`Stock ${type === 'add' ? 'added' : type === 'issue' ? 'issued' : 'returned'} successfully`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process transaction');
    } finally {
      setLoading(false);
    }
  };

  const isAdd = type === 'add';
  const isReturn = type === 'return';
  const isIssue = type === 'issue';

  const modalTitle = isAdd ? 'Add Stock (Inward)' : isIssue ? 'Issue Stock (Outward)' : 'Return Stock (Inward)';
  const titleColor = isAdd ? 'text-emerald-600' : isIssue ? 'text-amber-500' : 'text-blue-500';
  const btnColor = isAdd ? 'bg-emerald-500 hover:bg-emerald-600' : isIssue ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600';
  const btnText = isAdd ? 'Add Stock' : isIssue ? 'Issue Stock' : 'Return Stock';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl max-w-sm w-full relative z-10 p-6">
            <h3 className={`text-xl font-bold mb-4 ${titleColor}`}>
              {modalTitle}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-slate-600">Select Item</label>
                <select 
                  value={selectedStockId} 
                  onChange={(e) => setSelectedStockId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  required
                >
                  <option value="">-- Choose Item --</option>
                  {stocks.map((s: any) => (
                    <option key={s._id} value={s._id}>
                      {s.itemCode} - {s.name} (Avail: {s.quantity}, Issued: {s.issuedQuantity || 0})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-slate-600">
                  Quantity to {btnText.split(' ')[0]}
                </label>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={e => setQuantity(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg text-sm" 
                  required 
                />
              </div>
              {!isAdd && (
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-600">
                    {isIssue ? 'Issued To' : 'Returned By'} (Person Details)
                  </label>
                  <input 
                    type="text" 
                    value={personName} 
                    onChange={e => setPersonName(e.target.value)} 
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                    placeholder="e.g. John Doe, Class 10A"
                    required 
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-slate-50" onClick={onClose}>Cancel</button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className={`px-4 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-70 ${btnColor}`}
                >
                  {loading ? 'Processing...' : btnText}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function StockPage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modal states
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<any>(null);
  const [transactionType, setTransactionType] = useState<'add' | 'issue' | 'return' | null>(null);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/stock');
      setStocks(res.data);
    } catch (error) {
      console.error('Failed to fetch stocks', error);
      toast.error('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(stocks.map(s => s.category));
    return Array.from(cats);
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      const matchesSearch = 
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        stock.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === '' || stock.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [stocks, searchQuery, categoryFilter]);

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
      {/* Top Header Section */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="text-purple-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-indigo-900">Stock Management</h1>
            <p className="text-xs text-slate-400">Overview of inventory and stock levels</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => { setEditingStock(null); setIsItemModalOpen(true); }} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
          >
            <Box className="w-4 h-4" />
            Item Master
          </button>
          <button 
            onClick={() => setTransactionType('add')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200"
          >
            <Plus className="w-4 h-4" />
            Add Stock
          </button>
          <button 
            onClick={() => setTransactionType('issue')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors shadow-sm shadow-amber-200"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Issue Stock
          </button>
          <button 
            onClick={() => setTransactionType('return')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm shadow-blue-200"
          >
            <Undo2 className="w-4 h-4" />
            Return Stock
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-base font-bold text-slate-800">Current Stock Levels</h2>
          
          {/* Filters */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search code/name..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 border rounded-lg text-sm w-full sm:w-48 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="pl-9 pr-3 py-1.5 border rounded-lg text-sm w-full sm:w-40 bg-white focus:outline-none focus:border-purple-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#9352F3] text-white">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">ITEM CODE</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">ITEM NAME</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">CATEGORY</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-center">CURRENT STOCK</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-center">ISSUED</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">UNIT</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">STATUS</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">LAST UPDATED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    Loading stock data...
                  </td>
                </tr>
              ) : filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    No stock items found. Click "Item Master" to create your first item.
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stock) => (
                  <tr key={stock._id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => { setEditingStock(stock); setIsItemModalOpen(true); }}>
                    <td className="px-6 py-4 text-slate-600">{stock.itemCode}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{stock.name}</td>
                    <td className="px-6 py-4 text-slate-600">{stock.category}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[28px] h-[24px] px-2 rounded-md text-xs font-bold ${
                        stock.quantity <= 0 
                          ? 'bg-rose-500 text-white' 
                          : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {stock.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-amber-600 font-semibold">{stock.issuedQuantity || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{stock.unit || 'Pcs'}</td>
                    <td className="px-6 py-4">
                      {stock.quantity <= 0 ? (
                        <div className="flex items-center gap-1.5 text-rose-500 text-xs font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          Out of Stock
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          In Stock
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {formatDate(stock.updatedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StockModal 
        isOpen={isItemModalOpen} 
        onClose={() => { setIsItemModalOpen(false); setEditingStock(null); }} 
        onSuccess={fetchStocks} 
        initialData={editingStock} 
      />

      <TransactionModal
        isOpen={transactionType !== null}
        onClose={() => setTransactionType(null)}
        onSuccess={fetchStocks}
        type={transactionType}
        stocks={stocks}
      />
    </div>
  );
}
