import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

export const DashboardScreen = ({ navigation }: any) => {
  const { user, selectedStudent, children: childList, setSelectedStudent } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedStudent]);

  const fetchDashboardData = async () => {
    setRefreshing(true);
    try {
      if (selectedStudent && selectedStudent.id) {
        const [noticeRes] = await Promise.all([
          api.get('/api/notices').catch(() => ({ data: [] })),
        ]);

        if (noticeRes.data && Array.isArray(noticeRes.data)) {
          setNotices(noticeRes.data.slice(0, 3));
        }
      }
    } catch (error) {
      console.log('Dashboard fetch error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const childName = selectedStudent?.name || 'Karthik Murugan';
  const className = selectedStudent
    ? `${selectedStudent.grade}-${selectedStudent.section}`
    : 'Grade 10-A';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchDashboardData} />}
      >
        {/* Top Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>Welcome Parent,</Text>
              <Text style={styles.parentName}>{user?.name || 'Murugan V'}</Text>
            </View>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>👨‍👩‍👦</Text>
            </View>
          </View>

          {/* Child Profile Card */}
          <View style={styles.childCard}>
            <View style={styles.childAvatar}>
              <Text style={styles.childEmoji}>👦</Text>
            </View>
            <View style={styles.childInfo}>
              <Text style={styles.childName}>{childName}</Text>
              <Text style={styles.childClass}>
                {className} • Roll No: {selectedStudent?.rollNo || '1001'}
              </Text>
              <Text style={styles.admissionNo}>
                Adm No: {selectedStudent?.admissionNo || 'ADM-1001'}
              </Text>
            </View>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          </View>
        </View>

        {/* Quick KPI Stat Cards */}
        <Text style={styles.sectionTitle}>Overview Analytics</Text>
        <View style={styles.kpiGrid}>
          <TouchableOpacity
            style={[styles.kpiCard, { backgroundColor: '#e0e7ff' }]}
            onPress={() => navigation.navigate('Attendance')}
          >
            <Text style={styles.kpiIcon}>📅</Text>
            <Text style={styles.kpiValue}>94.5%</Text>
            <Text style={styles.kpiLabel}>Attendance Rate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.kpiCard, { backgroundColor: '#dcfce7' }]}
            onPress={() => navigation.navigate('Fees')}
          >
            <Text style={styles.kpiIcon}>💰</Text>
            <Text style={styles.kpiValue}>Pending</Text>
            <Text style={styles.kpiLabel}>Fee Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.kpiCard, { backgroundColor: '#f3e8ff' }]}
            onPress={() => navigation.navigate('Academic')}
          >
            <Text style={styles.kpiIcon}>🏆</Text>
            <Text style={styles.kpiValue}>A+</Text>
            <Text style={styles.kpiLabel}>Exam Rank (3rd)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.kpiCard, { backgroundColor: '#feefc3' }]}
            onPress={() => navigation.navigate('Transport')}
          >
            <Text style={styles.kpiIcon}>🚌</Text>
            <Text style={styles.kpiValue}>Bus #14</Text>
            <Text style={styles.kpiLabel}>Bus Route</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Modules Action Grid */}
        <Text style={styles.sectionTitle}>Quick Access Modules</Text>
        <View style={styles.moduleGrid}>
          {[
            { label: 'Attendance', icon: '📆', screen: 'Attendance', color: '#4f46e5' },
            { label: 'Fee Records', icon: '💳', screen: 'Fees', color: '#10b981' },
            { label: 'Report Card', icon: '📖', screen: 'Academic', color: '#8b5cf6' },
            { label: 'Bus Tracking', icon: '🚌', screen: 'Transport', color: '#f59e0b' },
            { label: 'Apply Leave', icon: '📝', screen: 'Leave', color: '#ec4899' },
            { label: 'Child Profile', icon: '👤', screen: 'Profile', color: '#06b6d4' },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.moduleCard}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.moduleIconBox, { backgroundColor: item.color }]}>
                <Text style={styles.moduleIconText}>{item.icon}</Text>
              </View>
              <Text style={styles.moduleLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Circular Announcements & Notices */}
        <Text style={styles.sectionTitle}>Latest School Circulars</Text>
        <View style={styles.noticeBox}>
          {notices.length === 0 ? (
            <View style={styles.noticeItem}>
              <View style={styles.noticeHeader}>
                <Text style={styles.noticeTitle}>Term 2 Tuition Fee & Transport Schedule</Text>
                <Text style={styles.noticeDate}>Oct 30</Text>
              </View>
              <Text style={styles.noticeContent}>
                Parents are requested to settle pending tuition and bus fees by 30th Oct 2026 via Parent Portal online.
              </Text>
            </View>
          ) : (
            notices.map((n, i) => (
              <View key={i} style={styles.noticeItem}>
                <View style={styles.noticeHeader}>
                  <Text style={styles.noticeTitle}>{n.title}</Text>
                  <Text style={styles.noticeDate}>
                    {new Date(n.date || n.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.noticeContent}>{n.content}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: '#4f46e5',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    color: '#c7d2fe',
    fontSize: 12,
    fontWeight: '700',
  },
  parentName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 20,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
  },
  childAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  childEmoji: {
    fontSize: 22,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  childClass: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4f46e5',
    marginTop: 2,
  },
  admissionNo: {
    fontSize: 10,
    color: '#64748b',
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadgeText: {
    color: '#15803d',
    fontSize: 10,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
    marginTop: 8,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  kpiCard: {
    width: '48%',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  kpiIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginTop: 2,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  moduleCard: {
    width: '31%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  moduleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleIconText: {
    fontSize: 20,
  },
  moduleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  noticeBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  noticeItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
  },
  noticeDate: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  noticeContent: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
  },
});
