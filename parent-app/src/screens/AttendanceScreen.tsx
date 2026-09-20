import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

interface AttendanceRecord {
  id: string;
  date: string;
  day: string;
  status: 'Present' | 'Absent' | 'On Duty' | 'Half Day' | 'Holiday';
  session: 'Full Day' | 'Morning' | 'Afternoon';
  remarks?: string;
}

import api from '../config/api';

export const AttendanceScreen = ({ navigation }: any) => {
  const { selectedStudent } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([
    { id: '1', date: '18 Sep 2026', day: 'Friday', status: 'Present', session: 'Full Day' },
    { id: '2', date: '17 Sep 2026', day: 'Thursday', status: 'Present', session: 'Full Day' },
    { id: '3', date: '16 Sep 2026', day: 'Wednesday', status: 'Present', session: 'Full Day' },
    { id: '4', date: '15 Sep 2026', day: 'Tuesday', status: 'Present', session: 'Full Day' },
    { id: '5', date: '14 Sep 2026', day: 'Monday', status: 'On Duty', session: 'Full Day', remarks: 'Inter-school Sports Meet' },
    { id: '6', date: '11 Sep 2026', day: 'Friday', status: 'Present', session: 'Full Day' },
    { id: '7', date: '10 Sep 2026', day: 'Thursday', status: 'Absent', session: 'Full Day', remarks: 'Medical Leave' },
    { id: '8', date: '09 Sep 2026', day: 'Wednesday', status: 'Present', session: 'Full Day' },
    { id: '9', date: '08 Sep 2026', day: 'Tuesday', status: 'Present', session: 'Full Day' },
    { id: '10', date: '07 Sep 2026', day: 'Monday', status: 'Present', session: 'Full Day' },
  ]);

  React.useEffect(() => {
    fetchAttendance();
  }, [selectedStudent]);

  const fetchAttendance = async () => {
    const studentId = selectedStudent?.id || selectedStudent?._id;
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/attendance/student/${studentId}`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: AttendanceRecord[] = res.data.map((item: any, idx: number) => {
          const d = new Date(item.date);
          const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
          const dateFormatted = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          const statusRaw = String(item.status).toUpperCase();
          let statusVal: AttendanceRecord['status'] = 'Present';
          if (statusRaw === 'ABSENT') statusVal = 'Absent';
          else if (statusRaw === 'ON DUTY' || statusRaw === 'OD') statusVal = 'On Duty';
          else if (statusRaw === 'HALF DAY') statusVal = 'Half Day';
          else if (statusRaw === 'HOLIDAY') statusVal = 'Holiday';

          return {
            id: String(idx + 1),
            date: dateFormatted,
            day: dayName,
            status: statusVal,
            session: 'Full Day',
          };
        });
        setRecords(mapped);
      }
    } catch (e) {
      console.log('Attendance fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const attendanceList = records;

  const getStatusColor = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'Present':
        return { bg: '#E6F4EA', text: '#137333', border: '#CEEAD6' };
      case 'Absent':
        return { bg: '#FCE8E6', text: '#C5221F', border: '#FAD2CF' };
      case 'On Duty':
        return { bg: '#E8F0FE', text: '#1A73E8', border: '#D2E3FC' };
      case 'Half Day':
        return { bg: '#FEF7E0', text: '#B06000', border: '#FEEFC3' };
      case 'Holiday':
        return { bg: '#F1F3F4', text: '#5F6368', border: '#E8EAED' };
      default:
        return { bg: '#F1F3F4', text: '#5F6368', border: '#E8EAED' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance Record</Text>
        <Text style={styles.headerSubtitle}>
          {selectedStudent ? `${selectedStudent.name} (${selectedStudent.grade}-${selectedStudent.section})` : 'Student Attendance'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity style={styles.monthButton}>
            <Text style={styles.monthButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>{selectedMonth}</Text>
          <TouchableOpacity style={styles.monthButton}>
            <Text style={styles.monthButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Overall Percentage Card */}
        <View style={styles.percentageCard}>
          <View style={styles.percentageCircle}>
            <Text style={styles.percentageNumber}>94.5%</Text>
            <Text style={styles.percentageLabel}>Attendance</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statCount, { color: '#10B981' }]}>19</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statCount, { color: '#EF4444' }]}>1</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statCount, { color: '#3B82F6' }]}>1</Text>
              <Text style={styles.statLabel}>On Duty</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statCount, { color: '#F59E0B' }]}>1</Text>
              <Text style={styles.statLabel}>Half Day</Text>
            </View>
          </View>
        </View>

        {/* Attendance Log Section */}
        <Text style={styles.sectionTitle}>Daily Log</Text>

        {attendanceList.map((item) => {
          const colors = getStatusColor(item.status);
          return (
            <View key={item.id} style={styles.logCard}>
              <View style={styles.logLeft}>
                <Text style={styles.logDate}>{item.date}</Text>
                <Text style={styles.logDay}>{item.day} • {item.session}</Text>
                {item.remarks && <Text style={styles.logRemarks}>Note: {item.remarks}</Text>}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                <Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text>
              </View>
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
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  monthButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  monthButtonText: {
    fontSize: 22,
    color: '#475569',
    fontWeight: 'bold',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  percentageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  percentageCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 6,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F0FDF4',
  },
  percentageNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#065F46',
  },
  percentageLabel: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '600',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statCount: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  logCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  logLeft: {
    flex: 1,
    marginRight: 10,
  },
  logDate: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  logDay: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  logRemarks: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 4,
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
