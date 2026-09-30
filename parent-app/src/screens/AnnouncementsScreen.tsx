import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../config/api';

export const AnnouncementsScreen = () => {
  const { selectedStudent } = useAuth();
  const { socket } = useSocket();

  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotices = async () => {
    try {
      const targetClass = selectedStudent?.grade ? `${selectedStudent.grade}-${selectedStudent.section}` : '';
      const response = await api.get(`/api/notices?targetAudience=Parents&classId=${targetClass}`);
      setNotices(response.data);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [selectedStudent]);

  useEffect(() => {
    if (!socket) return;

    const handleNoticeAdded = (newNotice: any) => {
      // Very basic filtering (Backend does the complex filtering, but for live push we can just prepend)
      if (newNotice.targetAudience === 'Parents' || newNotice.targetAudience === 'All') {
        setNotices(prev => [newNotice, ...prev]);
      }
    };

    socket.on('notice_created', handleNoticeAdded);

    return () => {
      socket.off('notice_created', handleNoticeAdded);
    };
  }, [socket]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotices();
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Announcements</Text>
        <Text style={styles.headerSubtitle}>Live school notices & updates</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {notices.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No announcements found.</Text>
          </View>
        ) : (
          notices.map((notice, index) => (
            <View key={notice._id || index} style={styles.noticeCard}>
              <View style={styles.noticeHeader}>
                <Text style={styles.noticeDate}>
                  {new Date(notice.date).toLocaleDateString()}
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>New</Text>
                </View>
              </View>
              <Text style={styles.noticeTitle}>{notice.title}</Text>
              <Text style={styles.noticeContent}>{notice.content}</Text>
            </View>
          ))
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noticeDate: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#4F46E5',
    fontSize: 11,
    fontWeight: '700',
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  noticeContent: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
});
