import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

interface AttendanceRecord {
  id: string;
  date: string;
  day: string;
  status: 'Present' | 'Absent' | 'On Duty' | 'Half Day' | 'Holiday';
  session: string;
  remarks?: string;
}

export const AttendanceScreen = ({ navigation }: any) => {
  const { selectedStudent } = useAuth();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    onDuty: 0,
    percentage: '0%',
  });

  useEffect(() => {
    fetchRealAttendance();
  }, [selectedStudent]);

  const fetchRealAttendance = async () => {
    setLoading(true);
    try {
      if (selectedStudent && selectedStudent.id) {
        const studentId = selectedStudent.id || (selectedStudent as any)._id;
        const res = await api.get(`/api/attendance/student/${studentId}`);

        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: AttendanceRecord[] = res.data.map((item: any, idx: number) => {
            const d = new Date(item.date);
            return {
              id: item._id || String(idx),
              date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
              day: d.toLocaleDateString('en-GB', { weekday: 'long' }),
              status: item.status || 'Present',
              session: 'Full Day',
              remarks: item.remarks,
            };
          });

          setRecords(mapped);

          const pres = mapped.filter((r) => r.status === 'Present').length;
          const abs = mapped.filter((r) => r.status === 'Absent').length;
          const od = mapped.filter((r) => r.status === 'On Duty').length;
          const total = mapped.length;
          const pct = total > 0 ? `${Math.round((pres / total) * 100)}%` : '0%';

          setStats({
            present: pres,
            absent: abs,
            onDuty: od,
            percentage: pct,
          });
        } else {
          setRecords([]);
          setStats({ present: 0, absent: 0, onDuty: 0, percentage: '0%' });
        }
      }
    } catch (error) {
      console.log('Error fetching student attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return { bg: '#E6F4EA', text: '#137333', border: '#CEEAD6' };
      case 'Absent':
        return { bg: '#FCE8E6', text: '#C5221F', border: '#FAD2CF' };
      case 'On Duty':
        return { bg: '#E8F0FE', text: '#1A73E8', border: '#D2E3FC' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchRealAttendance} colors={['#2563EB']} />}
    >
      {/* Student Profile Info */}
      <View style={styles.summaryCard}>
        <View style={styles.childHeader}>
          <View>
            <Text style={styles.childName}>{selectedStudent?.name || 'Student'}</Text>
            <Text style={styles.childMeta}>
              {selectedStudent?.grade}-{selectedStudent?.section} • Roll: {selectedStudent?.rollNo}
            </Text>
          </View>
          <View style={styles.liveSyncBadge}>
            <Text style={styles.liveSyncText}>MongoDB Live</Text>
          </View>
        </View>

        {/* Big Percentage & Count */}
        <View style={styles.statsRow}>
          <View style={styles.percentageCircle}>
            <Text style={styles.percentageNumber}>{stats.percentage}</Text>
            <Text style={styles.percentageLabel}>Attendance</Text>
          </View>

          <View style={styles.statCounters}>
            <View style={styles.counterBox}>
              <Text style={[styles.counterNum, { color: '#16A34A' }]}>{stats.present}</Text>
              <Text style={styles.counterLabel}>Present</Text>
            </View>
            <View style={styles.counterBox}>
              <Text style={[styles.counterNum, { color: '#DC2626' }]}>{stats.absent}</Text>
              <Text style={styles.counterLabel}>Absent</Text>
            </View>
            <View style={styles.counterBox}>
              <Text style={[styles.counterNum, { color: '#2563EB' }]}>{stats.onDuty}</Text>
              <Text style={styles.counterLabel}>On Duty</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Real Attendance Timeline Logs */}
      <Text style={styles.sectionHeading}>Attendance History Logs</Text>

      {loading ? (
        <ActivityIndicator size="small" color="#2563EB" style={{ marginTop: 20 }} />
      ) : records.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>No Attendance Records Found</Text>
          <Text style={styles.emptyText}>
            Attendance is recorded daily by the class teacher. Logs will sync here in real time.
          </Text>
        </View>
      ) : (
        records.map((rec) => {
          const colors = getStatusColor(rec.status);
          return (
            <View key={rec.id} style={styles.recordCard}>
              <View style={styles.recordLeft}>
                <Text style={styles.recordDate}>{rec.date}</Text>
                <Text style={styles.recordDay}>{rec.day}</Text>
              </View>

              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: colors.bg, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.statusPillText, { color: colors.text }]}>
                  {rec.status}
                </Text>
              </View>
            </View>
          );
        })
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  childName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  childMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  liveSyncBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  liveSyncText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  percentageCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FEF3C7',
    borderWidth: 4,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#92400E',
  },
  percentageLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  statCounters: {
    flexDirection: 'row',
    gap: 12,
  },
  counterBox: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 56,
  },
  counterNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  counterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
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
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recordLeft: {
    flex: 1,
  },
  recordDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  recordDay: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
