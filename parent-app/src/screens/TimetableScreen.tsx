import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

export const TimetableScreen = () => {
  const { selectedStudent } = useAuth();
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!selectedStudent) return;
      try {
        const response = await api.get(`/api/timetable?classId=${selectedStudent.grade}-${selectedStudent.section}`);
        // Organize by day
        setTimetable(response.data);
      } catch (error) {
        console.error('Failed to fetch timetable:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [selectedStudent]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Class Timetable</Text>
        <Text style={styles.headerSubtitle}>
          {selectedStudent ? `${selectedStudent.grade}-${selectedStudent.section} Weekly Schedule` : 'Weekly Schedule'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {days.map(day => {
          const dayPeriods = timetable.filter(t => t.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
          if (dayPeriods.length === 0) return null;

          return (
            <View key={day} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>{day}</Text>
              </View>
              {dayPeriods.map((period, idx) => (
                <View key={period._id || idx} style={styles.periodRow}>
                  <View style={styles.timeCol}>
                    <Text style={styles.timeText}>{period.startTime}</Text>
                    <Text style={styles.timeSubText}>{period.endTime}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.subjectCol}>
                    <Text style={styles.subjectText}>{period.subject}</Text>
                    <Text style={styles.teacherText}>{period.teacherName}</Text>
                  </View>
                </View>
              ))}
            </View>
          );
        })}
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
  dayCard: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, overflow: 'hidden' },
  dayHeader: { backgroundColor: '#EEF2FF', paddingVertical: 12, paddingHorizontal: 16 },
  dayTitle: { fontSize: 16, fontWeight: '700', color: '#3730A3' },
  periodRow: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  timeCol: { width: 80, justifyContent: 'center' },
  timeText: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  timeSubText: { fontSize: 11, color: '#64748B', marginTop: 2 },
  divider: { width: 3, backgroundColor: '#E2E8F0', borderRadius: 2, marginHorizontal: 12 },
  subjectCol: { flex: 1, justifyContent: 'center' },
  subjectText: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  teacherText: { fontSize: 13, color: '#475569', marginTop: 2 },
});
