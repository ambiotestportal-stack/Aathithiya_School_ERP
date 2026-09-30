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

export const HomeworkScreen = () => {
  const { selectedStudent } = useAuth();
  const { socket } = useSocket();

  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHomeworks = async () => {
    if (!selectedStudent) return;
    try {
      const response = await api.get(`/api/homework?classId=${selectedStudent.grade}-${selectedStudent.section}`);
      setHomeworks(response.data);
    } catch (error) {
      console.error('Failed to fetch homework:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHomeworks();
  }, [selectedStudent]);

  useEffect(() => {
    if (!socket || !selectedStudent) return;

    const handleHomeworkAdded = (hw: any) => {
      // Very basic checking, usually backend does this
      setHomeworks(prev => [hw, ...prev]);
    };

    socket.on('homework_created', handleHomeworkAdded);

    return () => {
      socket.off('homework_created', handleHomeworkAdded);
    };
  }, [socket, selectedStudent]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeworks();
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
        <Text style={styles.headerTitle}>Homework</Text>
        <Text style={styles.headerSubtitle}>
          {selectedStudent ? `${selectedStudent.name}'s Assignments` : 'Assignments'}
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {homeworks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No homework assigned.</Text>
          </View>
        ) : (
          homeworks.map((hw, index) => (
            <View key={hw._id || index} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.subjectBadge}>
                  <Text style={styles.subjectText}>{hw.subject}</Text>
                </View>
                <Text style={styles.dueDate}>Due: {new Date(hw.dueDate).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.title}>{hw.title}</Text>
              <Text style={styles.description}>{hw.description}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: 15, color: '#64748B', marginTop: 4 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  emptyCard: { backgroundColor: '#FFFFFF', padding: 30, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  emptyText: { fontSize: 16, color: '#94A3B8' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  subjectBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  subjectText: { color: '#16A34A', fontSize: 12, fontWeight: '700' },
  dueDate: { fontSize: 12, color: '#EF4444', fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  description: { fontSize: 14, color: '#475569', lineHeight: 22 },
});
