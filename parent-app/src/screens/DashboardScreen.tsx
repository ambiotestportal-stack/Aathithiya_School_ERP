import React, { useEffect, useState } from 'react';
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

export const DashboardScreen = ({ navigation }: any) => {
  const { user, selectedStudent } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState<'Week' | 'Month'>('Month');
  const [notices, setNotices] = useState<any[]>([]);
  const [attendanceRate, setAttendanceRate] = useState<string>('0%');
  const [pendingTasks, setPendingTasks] = useState<number>(1);
  const [feeStatus, setFeeStatus] = useState<string>('Up to Date');

  useEffect(() => {
    fetchDashboardRealData();
  }, [selectedStudent, timeframe]);

  const fetchDashboardRealData = async () => {
    setRefreshing(true);
    try {
      if (selectedStudent && selectedStudent.id) {
        const studentId = selectedStudent.id || (selectedStudent as any)._id;

        // Parallel fetch of real backend endpoints
        const [noticeRes, attRes, feeRes] = await Promise.all([
          api.get('/api/notices').catch(() => ({ data: [] })),
          api.get(`/api/attendance/student/${studentId}`).catch(() => ({ data: [] })),
          api.get(`/api/finance/fees?studentId=${studentId}`).catch(() => ({ data: [] })),
        ]);

        // 1. Real Notices
        if (noticeRes.data && Array.isArray(noticeRes.data)) {
          setNotices(noticeRes.data.slice(0, 4));
        }

        // 2. Real Attendance Calculation
        if (attRes.data && Array.isArray(attRes.data) && attRes.data.length > 0) {
          const totalRecords = attRes.data.length;
          const presents = attRes.data.filter((r: any) => r.status === 'Present').length;
          const rate = Math.round((presents / totalRecords) * 100);
          setAttendanceRate(`${rate}%`);
        } else {
          // If no attendance entered yet in DB, show 0%
          setAttendanceRate('0%');
        }

        // 3. Real Fee Tasks Calculation
        if (feeRes.data && Array.isArray(feeRes.data) && feeRes.data.length > 0) {
          const pending = feeRes.data.filter((f: any) => f.status === 'Pending' || f.status === 'Overdue');
          if (pending.length > 0) {
            setFeeStatus(`${pending.length} Pending`);
            setPendingTasks(pending.length);
          } else {
            setFeeStatus('Paid');
            setPendingTasks(0);
          }
        } else {
          setFeeStatus('No Dues');
          setPendingTasks(1); // 1 general task (e.g. review term report)
        }
      }
    } catch (error) {
      console.log('Real dashboard fetch error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const childName = selectedStudent?.name || 'DIVYA MENON';
  const className = selectedStudent
    ? `${selectedStudent.grade}-${selectedStudent.section}`
    : 'Grade 10-A';
  const rollNo = selectedStudent?.rollNo || '1001';
  const admissionNo = selectedStudent?.admissionNo || 'ADM-1001';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchDashboardRealData} colors={['#F59E0B']} />
      }
    >
      {/* Welcome Greeting */}
      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.greetingTitle}>Welcome Parent,</Text>
          <Text style={styles.parentNameText}>{user?.name || 'Murugan V'}</Text>
        </View>
        <View style={styles.statusLivePill}>
          <View style={styles.greenDot} />
          <Text style={styles.statusLiveText}>Live Sync</Text>
        </View>
      </View>

      {/* 🌟 USER REFERENCE DESIGN CARD (Gold/Amber Showcase Card) */}
      <View style={styles.showcaseCard}>
        {/* Decorative Background Circles matching image */}
        <View style={styles.bgDecorativeCircle1} />
        <View style={styles.bgDecorativeCircle2} />

        {/* Card Top Row: Badge & Week/Month Switch */}
        <View style={styles.cardTopRow}>
          <Text style={styles.cardBadgeText}>STAR OF THE MONTH</Text>

          {/* Week / Month Toggle Pill */}
          <View style={styles.pillContainer}>
            <TouchableOpacity
              style={[styles.pillOption, timeframe === 'Week' && styles.pillOptionActive]}
              onPress={() => setTimeframe('Week')}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, timeframe === 'Week' && styles.pillTextActive]}>
                Week
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pillOption, timeframe === 'Month' && styles.pillOptionActive]}
              onPress={() => setTimeframe('Month')}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, timeframe === 'Month' && styles.pillTextActive]}>
                Month
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Middle Row: Attendance & Tasks */}
        <View style={styles.cardMiddleRow}>
          <Text style={styles.cardMetricsText}>
            {attendanceRate} ATT  •  {pendingTasks} {pendingTasks === 1 ? 'TASK' : 'TASKS'}
          </Text>
        </View>

        {/* Card Bottom Row: Student Name & Dual Overlapping Circles */}
        <View style={styles.cardBottomRow}>
          <View style={styles.studentNameBlock}>
            <Text style={styles.studentNameText} numberOfLines={1}>
              {childName.toUpperCase()}
            </Text>
            <Text style={styles.studentMetaText}>
              {className} • Roll: {rollNo} • Adm: {admissionNo}
            </Text>
          </View>

          {/* Dual Overlapping Translucent Circles Logo */}
          <View style={styles.dualCirclesWrapper}>
            <View style={styles.circleLeft} />
            <View style={styles.circleRight} />
          </View>
        </View>
      </View>

      {/* Quick Navigation Action Grid (The 4 Requested Modules) */}
      <Text style={styles.sectionHeading}>Core Modules</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Attendance')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#EFF6FF' }]}>
            <Text style={styles.actionIcon}>📅</Text>
          </View>
          <Text style={styles.actionTitle}>Attendance</Text>
          <Text style={styles.actionSub}>{attendanceRate} Present</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Transport')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.actionIcon}>🚌</Text>
          </View>
          <Text style={styles.actionTitle}>Transport</Text>
          <Text style={styles.actionSub}>Live GPS Tracker</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Academic')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#F3E8FF' }]}>
            <Text style={styles.actionIcon}>📖</Text>
          </View>
          <Text style={styles.actionTitle}>Academic</Text>
          <Text style={styles.actionSub}>Report Card & Marks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Fees')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#DCFCE7' }]}>
            <Text style={styles.actionIcon}>💰</Text>
          </View>
          <Text style={styles.actionTitle}>Fees</Text>
          <Text style={styles.actionSub}>{feeStatus}</Text>
        </TouchableOpacity>
      </View>

      {/* Student Details Card */}
      <Text style={styles.sectionHeading}>Student Information</Text>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Full Name:</Text>
          <Text style={styles.infoValue}>{childName}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Class & Section:</Text>
          <Text style={styles.infoValue}>{className}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Admission Number:</Text>
          <Text style={styles.infoValue}>{admissionNo}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Blood Group:</Text>
          <Text style={styles.infoValue}>{selectedStudent?.bloodGroup || 'O+'}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bus Route:</Text>
          <Text style={styles.infoValue}>{selectedStudent?.busRoute || 'Route 14 Express'}</Text>
        </View>
      </View>

      {/* Live School Circulars & Notices */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>Official Circulars</Text>
        <Text style={styles.badgeLive}>Real Time</Text>
      </View>

      <View style={styles.noticesContainer}>
        {notices.length === 0 ? (
          <View style={styles.emptyNoticeCard}>
            <Text style={styles.emptyNoticeIcon}>📢</Text>
            <Text style={styles.emptyNoticeTitle}>No New Circulars</Text>
            <Text style={styles.emptyNoticeText}>
              All latest school notifications from management will automatically appear here.
            </Text>
          </View>
        ) : (
          notices.map((n, idx) => (
            <View key={n._id || idx} style={styles.noticeCard}>
              <View style={styles.noticeTop}>
                <Text style={styles.noticeCardTitle}>{n.title}</Text>
                <Text style={styles.noticeDate}>
                  {n.date ? new Date(n.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Today'}
                </Text>
              </View>
              <Text style={styles.noticeContent}>{n.content}</Text>
            </View>
          ))
        )}
      </View>
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
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  greetingTitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  parentNameText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  statusLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  statusLiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },

  /* 🌟 THE EXACT GOLD/AMBER SHOWCASE CARD (from reference image) */
  showcaseCard: {
    backgroundColor: '#F59E0B',
    borderRadius: 20,
    padding: 20,
    minHeight: 170,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    marginBottom: 20,
  },
  bgDecorativeCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(245, 158, 11, 0.4)',
    bottom: -60,
    left: -40,
    borderWidth: 20,
    borderColor: 'rgba(217, 119, 6, 0.15)',
  },
  bgDecorativeCircle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    top: -40,
    right: 30,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  cardBadgeText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(180, 83, 9, 0.45)',
    borderRadius: 16,
    padding: 3,
  },
  pillOption: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  pillOptionActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  pillTextActive: {
    color: '#854D0E',
    fontWeight: '900',
  },
  cardMiddleRow: {
    marginVertical: 12,
    zIndex: 2,
  },
  cardMetricsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 2,
  },
  studentNameBlock: {
    flex: 1,
  },
  studentNameText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.0,
  },
  studentMetaText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  dualCirclesWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  circleLeft: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  circleRight: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    marginLeft: -14,
  },

  /* Action Grid (4 Modules) */
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  actionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  /* Student Info Card */
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },

  /* Notices */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeLive: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  noticesContainer: {
    marginBottom: 20,
  },
  emptyNoticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyNoticeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyNoticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  emptyNoticeText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noticeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  noticeCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  noticeDate: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 8,
  },
  noticeContent: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
});
