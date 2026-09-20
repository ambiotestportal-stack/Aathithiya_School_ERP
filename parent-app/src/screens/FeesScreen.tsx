import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

interface FeeRecord {
  id: string;
  category: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'Paid' | 'Pending' | 'Partial' | 'Overdue';
}

export const FeesScreen = ({ navigation }: any) => {
  const { selectedStudent } = useAuth();
  const [loading, setLoading] = useState(false);
  const [feeItems, setFeeItems] = useState<FeeRecord[]>([]);

  useEffect(() => {
    fetchRealFees();
  }, [selectedStudent]);

  const fetchRealFees = async () => {
    setLoading(true);
    try {
      if (selectedStudent && selectedStudent.id) {
        const studentId = selectedStudent.id || (selectedStudent as any)._id;
        const res = await api.get(`/api/finance/fees?studentId=${studentId}`).catch(() => ({ data: [] }));

        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: FeeRecord[] = res.data.map((item: any, idx: number) => ({
            id: item._id || String(idx),
            category: item.feeType || item.category || 'Tuition Fee',
            dueDate: item.dueDate
              ? new Date(item.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'End of Term',
            amount: Number(item.amount) || 0,
            paidAmount: Number(item.paidAmount) || 0,
            status: item.status || (item.paidAmount >= item.amount ? 'Paid' : 'Pending'),
          }));
          setFeeItems(mapped);
        } else {
          setFeeItems([]);
        }
      }
    } catch (e) {
      console.log('Error fetching fee data:', e);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = feeItems.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = feeItems.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalPending = totalAmount - totalPaid;

  const handlePayNow = (item: FeeRecord) => {
    Alert.alert(
      'Online Payment Gateway',
      `Proceed to pay ₹${(item.amount - item.paidAmount).toLocaleString('en-IN')} for ${item.category}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed to Pay',
          onPress: () => Alert.alert('Payment Portal', 'Online payment simulation complete.'),
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchRealFees} colors={['#10B981']} />}
    >
      {/* Fee Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>TOTAL OUTSTANDING DUES</Text>
        <Text style={styles.summaryPendingAmount}>₹{totalPending.toLocaleString('en-IN')}</Text>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summarySubLabel}>Total Annual Fee</Text>
            <Text style={styles.summarySubVal}>₹{totalAmount.toLocaleString('en-IN')}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.summarySubLabel}>Total Paid</Text>
            <Text style={[styles.summarySubVal, { color: '#10B981' }]}>
              ₹{totalPaid.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </View>

      {/* Fee Invoices List */}
      <Text style={styles.sectionHeading}>Invoices & Dues</Text>

      {loading ? (
        <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 20 }} />
      ) : feeItems.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🎉</Text>
          <Text style={styles.emptyTitle}>All Dues Cleared</Text>
          <Text style={styles.emptyText}>
            No outstanding fee invoices pending for {selectedStudent?.name || 'this student'}. Official school invoices will sync here in real time.
          </Text>
        </View>
      ) : (
        feeItems.map((item) => (
          <View key={item.id} style={styles.feeCard}>
            <View style={styles.feeCardTop}>
              <View>
                <Text style={styles.feeCategory}>{item.category}</Text>
                <Text style={styles.feeDueDate}>Due: {item.dueDate}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  item.status === 'Paid' ? styles.statusBadgePaid : styles.statusBadgePending,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    item.status === 'Paid' ? styles.statusTextPaid : styles.statusTextPending,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>

            <View style={styles.feeCardBottom}>
              <View>
                <Text style={styles.amountLabel}>Total Amount</Text>
                <Text style={styles.amountVal}>₹{item.amount.toLocaleString('en-IN')}</Text>
              </View>

              {item.status !== 'Paid' && (
                <TouchableOpacity
                  style={styles.payBtn}
                  onPress={() => handlePayNow(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.payBtnText}>Pay ₹{(item.amount - item.paidAmount).toLocaleString('en-IN')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  summaryLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.0,
  },
  summaryPendingAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
    marginBottom: 16,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summarySubLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  summarySubVal: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  feeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  feeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  feeCategory: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  feeDueDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgePaid: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgePending: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusTextPaid: {
    color: '#15803D',
  },
  statusTextPending: {
    color: '#B91C1C',
  },
  feeCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  amountLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  amountVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  payBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
