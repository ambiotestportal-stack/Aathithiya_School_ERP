import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

interface FeeItem {
  id: string;
  category: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'Paid' | 'Pending' | 'Partial';
}

interface PaymentReceipt {
  id: string;
  receiptNo: string;
  date: string;
  amount: number;
  mode: string;
  category: string;
}

import api from '../config/api';

export const FeesScreen = () => {
  const { selectedStudent } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'receipts'>('pending');
  const [loading, setLoading] = useState(false);
  const [feeItems, setFeeItems] = useState<FeeItem[]>([
    { id: '1', category: 'Term 2 Tuition Fee', dueDate: '30 Oct 2026', amount: 25000, paidAmount: 0, status: 'Pending' },
    { id: '2', category: 'Transport Fee (Q3)', dueDate: '15 Nov 2026', amount: 6500, paidAmount: 0, status: 'Pending' },
    { id: '3', category: 'Annual Sports & Activity', dueDate: '05 Sep 2026', amount: 3500, paidAmount: 3500, status: 'Paid' },
    { id: '4', category: 'Term 1 Tuition Fee', dueDate: '10 Jun 2026', amount: 25000, paidAmount: 25000, status: 'Paid' },
  ]);

  const [paymentReceipts, setPaymentReceipts] = useState<PaymentReceipt[]>([
    { id: 'r1', receiptNo: 'REC-2026-0982', date: '04 Sep 2026', amount: 3500, mode: 'UPI / GPay', category: 'Sports & Activity' },
    { id: 'r2', receiptNo: 'REC-2026-0412', date: '08 Jun 2026', amount: 25000, mode: 'Net Banking', category: 'Term 1 Tuition Fee' },
    { id: 'r3', receiptNo: 'REC-2026-0105', date: '12 Apr 2026', amount: 6500, mode: 'Credit Card', category: 'Transport Fee (Q1)' },
  ]);

  React.useEffect(() => {
    fetchFees();
  }, [selectedStudent]);

  const fetchFees = async () => {
    const studentId = selectedStudent?.id || selectedStudent?._id;
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/finance/fees?studentId=${studentId}`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: FeeItem[] = res.data.map((f: any, idx: number) => ({
          id: f._id || String(idx + 1),
          category: f.feeName || 'Tuition Fee',
          dueDate: f.dueDate ? new Date(f.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '30 Oct 2026',
          amount: Number(f.amount) || 0,
          paidAmount: f.status === 'Paid' ? (Number(f.amount) || 0) : 0,
          status: f.status === 'Paid' ? 'Paid' : 'Pending',
        }));
        setFeeItems(mapped);

        const paidOnly = mapped.filter((m) => m.status === 'Paid');
        if (paidOnly.length > 0) {
          setPaymentReceipts(
            paidOnly.map((p, idx) => ({
              id: `rec-${idx + 1}`,
              receiptNo: `REC-2026-${1000 + idx}`,
              date: p.dueDate,
              amount: p.amount,
              mode: 'Online Payment',
              category: p.category,
            }))
          );
        }
      }
    } catch (e) {
      console.log('Fee fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = feeItems.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = feeItems.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalPending = totalAmount - totalPaid;

  const handlePayNow = (item: FeeItem) => {
    Alert.alert(
      'Online Payment Gateway',
      `Proceed to pay ₹${(item.amount - item.paidAmount).toLocaleString('en-IN')} for ${item.category}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed to Pay',
          onPress: () => Alert.alert('Success', 'Payment simulated successfully! Receipt generated.'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fee Management</Text>
        <Text style={styles.headerSubtitle}>
          {selectedStudent ? `${selectedStudent.name} (${selectedStudent.admissionNo})` : 'Fee Details'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Due Balance</Text>
          <Text style={styles.summaryPendingAmount}>₹{totalPending.toLocaleString('en-IN')}</Text>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summarySubLabel}>Total Annual Fee</Text>
              <Text style={styles.summarySubVal}>₹{totalAmount.toLocaleString('en-IN')}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.summarySubLabel}>Total Paid</Text>
              <Text style={[styles.summarySubVal, { color: '#10B981' }]}>₹{totalPaid.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'pending' && styles.tabButtonActive]}
            onPress={() => setActiveTab('pending')}
          >
            <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
              Fee Structure ({feeItems.filter(i => i.status !== 'Paid').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'receipts' && styles.tabButtonActive]}
            onPress={() => setActiveTab('receipts')}
          >
            <Text style={[styles.tabText, activeTab === 'receipts' && styles.tabTextActive]}>
              Payment History ({paymentReceipts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'pending' ? (
          <View>
            {feeItems.map((item) => {
              const isPaid = item.status === 'Paid';
              return (
                <View key={item.id} style={styles.feeCard}>
                  <View style={styles.feeHeader}>
                    <Text style={styles.feeCategory}>{item.category}</Text>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: isPaid ? '#E6F4EA' : '#FEF3C7' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: isPaid ? '#137333' : '#D97706' },
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.feeDetailsRow}>
                    <Text style={styles.feeDueText}>Due Date: {item.dueDate}</Text>
                    <Text style={styles.feeAmount}>₹{item.amount.toLocaleString('en-IN')}</Text>
                  </View>

                  {!isPaid && (
                    <TouchableOpacity
                      style={styles.payBtn}
                      onPress={() => handlePayNow(item)}
                    >
                      <Text style={styles.payBtnText}>Pay Now ₹{(item.amount - item.paidAmount).toLocaleString('en-IN')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <View>
            {paymentReceipts.map((receipt) => (
              <View key={receipt.id} style={styles.receiptCard}>
                <View style={styles.receiptTop}>
                  <View>
                    <Text style={styles.receiptNo}>{receipt.receiptNo}</Text>
                    <Text style={styles.receiptCategory}>{receipt.category}</Text>
                  </View>
                  <Text style={styles.receiptAmount}>₹{receipt.amount.toLocaleString('en-IN')}</Text>
                </View>

                <View style={styles.receiptBottom}>
                  <Text style={styles.receiptMeta}>Date: {receipt.date}</Text>
                  <Text style={styles.receiptMeta}>Mode: {receipt.mode}</Text>
                </View>

                <TouchableOpacity
                  style={styles.downloadBtn}
                  onPress={() => Alert.alert('Download Receipt', `Downloading PDF receipt ${receipt.receiptNo}...`)}
                >
                  <Text style={styles.downloadBtnText}>📄 Download PDF Receipt</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  summaryLabel: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryPendingAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 4,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summarySubLabel: {
    color: '#BFDBFE',
    fontSize: 12,
  },
  summarySubVal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#1E293B',
  },
  feeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  feeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeCategory: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  feeDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  feeDueText: {
    fontSize: 13,
    color: '#64748B',
  },
  feeAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  payBtn: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  receiptTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  receiptNo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  receiptCategory: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  receiptAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#10B981',
  },
  receiptBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  receiptMeta: {
    fontSize: 12,
    color: '#94A3B8',
  },
  downloadBtn: {
    marginTop: 12,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadBtnText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
});
