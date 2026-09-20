import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedDate: string;
  remarks?: string;
}

export const LeaveScreen = () => {
  const { selectedStudent } = useAuth();

  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pastLeaves, setPastLeaves] = useState<LeaveRequest[]>([
    {
      id: 'l1',
      leaveType: 'Sick Leave',
      startDate: '10 Sep 2026',
      endDate: '10 Sep 2026',
      reason: 'Fever and viral flu symptoms.',
      status: 'Approved',
      appliedDate: '09 Sep 2026',
      remarks: 'Approved by Class Teacher Mrs. S. Priya',
    },
    {
      id: 'l2',
      leaveType: 'Casual Leave',
      startDate: '24 Aug 2026',
      endDate: '25 Aug 2026',
      reason: 'Attending family wedding event.',
      status: 'Approved',
      appliedDate: '20 Aug 2026',
      remarks: 'Approved',
    },
  ]);

  const handleSubmitLeave = () => {
    if (!startDate || !endDate || !reason) {
      Alert.alert('Missing Fields', 'Please fill in Start Date, End Date, and Reason for leave.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newLeave: LeaveRequest = {
        id: `l_${Date.now()}`,
        leaveType,
        startDate,
        endDate,
        reason,
        status: 'Pending',
        appliedDate: 'Today',
      };

      setPastLeaves([newLeave, ...pastLeaves]);
      setIsSubmitting(false);
      setStartDate('');
      setEndDate('');
      setReason('');

      Alert.alert('Application Submitted', 'Student leave request sent to class teacher for approval.');
    }, 800);
  };

  const getStatusColor = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'Approved':
        return { bg: '#E6F4EA', text: '#137333' };
      case 'Pending':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'Rejected':
        return { bg: '#FCE8E6', text: '#C5221F' };
      default:
        return { bg: '#F1F3F4', text: '#5F6368' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Apply Student Leave</Text>
        <Text style={styles.headerSubtitle}>
          {selectedStudent ? `${selectedStudent.name} (${selectedStudent.grade}-${selectedStudent.section})` : 'Submit Leave Application'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Application Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>New Leave Request</Text>

          {/* Leave Type Selector */}
          <Text style={styles.inputLabel}>Leave Type</Text>
          <View style={styles.typeSelector}>
            {['Sick Leave', 'Casual Leave', 'Emergency'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeChip, leaveType === type && styles.typeChipActive]}
                onPress={() => setLeaveType(type)}
              >
                <Text style={[styles.typeChipText, leaveType === type && styles.typeChipTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Dates Input */}
          <View style={styles.rowInputs}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.inputLabel}>From Date</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#94A3B8"
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.inputLabel}>To Date</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#94A3B8"
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>
          </View>

          {/* Reason Input */}
          <Text style={styles.inputLabel}>Reason for Leave</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="State the detailed reason for absence..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            value={reason}
            onChangeText={setReason}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSubmitLeave}
            disabled={isSubmitting}
          >
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Past Requests History */}
        <Text style={styles.sectionTitle}>Application History</Text>

        {pastLeaves.map((item) => {
          const colors = getStatusColor(item.status);
          return (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.historyTop}>
                <View>
                  <Text style={styles.historyType}>{item.leaveType}</Text>
                  <Text style={styles.historyDates}>
                    📅 {item.startDate} — {item.endDate}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text>
                </View>
              </View>

              <Text style={styles.historyReason}>"{item.reason}"</Text>

              {item.remarks && (
                <Text style={styles.historyRemarks}>Note: {item.remarks}</Text>
              )}
            </View>
          );
        })}
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
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  typeChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  typeChipActive: {
    backgroundColor: '#2563EB',
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  typeChipTextActive: {
    color: '#FFFFFF',
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  historyCard: {
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
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  historyDates: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  historyReason: {
    fontSize: 13,
    color: '#334155',
    marginTop: 10,
    fontStyle: 'italic',
  },
  historyRemarks: {
    fontSize: 12,
    color: '#059669',
    marginTop: 6,
    fontWeight: '500',
  },
});
