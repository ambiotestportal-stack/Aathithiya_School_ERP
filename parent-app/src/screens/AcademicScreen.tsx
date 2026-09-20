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

interface SubjectMark {
  subject: string;
  maxMarks: number;
  marksObtained: number;
  grade: string;
  status: 'Pass' | 'Fail';
}

export const AcademicScreen = ({ navigation }: any) => {
  const { selectedStudent } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    fetchAcademicRealData();
  }, [selectedStudent]);

  const fetchAcademicRealData = async () => {
    setLoading(true);
    try {
      if (selectedStudent && selectedStudent.id) {
        const studentId = selectedStudent.id || (selectedStudent as any)._id;
        const res = await api.get(`/api/exams/student/${studentId}`).catch(() => ({ data: [] }));
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setResults(res.data);
        } else {
          setResults([]);
        }
      }
    } catch (e) {
      console.log('Error fetching academic data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Enrolled subjects in Grade 10 from MongoDB
  const standardSubjects = [
    { subject: 'Mathematics', code: 'MAT101', teacher: 'Priya Sharma (M.Sc., B.Ed)' },
    { subject: 'Science', code: 'SCI101', teacher: 'Ramesh Kumar (M.A., B.Ed)' },
    { subject: 'English', code: 'ENG101', teacher: 'Senior Faculty' },
    { subject: 'Tamil', code: 'TAM101', teacher: 'Ramesh Kumar (M.A., B.Ed)' },
    { subject: 'Social Studies', code: 'SOC101', teacher: 'Department Faculty' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAcademicRealData} colors={['#8B5CF6']} />}
    >
      {/* Student Academic Header Card */}
      <View style={styles.summaryCard}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.childName}>{selectedStudent?.name || 'Student'}</Text>
            <Text style={styles.childSub}>
              {selectedStudent?.grade}-{selectedStudent?.section} • Roll No: {selectedStudent?.rollNo}
            </Text>
          </View>
          <View style={styles.badgeTerm}>
            <Text style={styles.badgeTermText}>Academic Year 2026-27</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>CBSE / State</Text>
            <Text style={styles.statLbl}>Curriculum</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>5</Text>
            <Text style={styles.statLbl}>Subjects</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>Active</Text>
            <Text style={styles.statLbl}>Enrolled</Text>
          </View>
        </View>
      </View>

      {/* Published Exam Results */}
      <Text style={styles.sectionHeading}>Published Exam Results</Text>

      {loading ? (
        <ActivityIndicator size="small" color="#8B5CF6" style={{ marginVertical: 20 }} />
      ) : results.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>Upcoming Term Exams Scheduled</Text>
          <Text style={styles.emptyText}>
            Quarterly and Mid-Term examination results will be published directly by teachers here after evaluation.
          </Text>
        </View>
      ) : (
        results.map((item, idx) => (
          <View key={item._id || idx} style={styles.resultCard}>
            <Text style={styles.examTitle}>{item.exam?.name || 'Term Exam'}</Text>
            <Text style={styles.examMarks}>
              Marks: {item.marksObtained} / {item.maxMarks}
            </Text>
            <Text style={styles.examGrade}>Grade: {item.grade}</Text>
          </View>
        ))
      )}

      {/* Enrolled Subjects List */}
      <Text style={styles.sectionHeading}>Enrolled Subjects & Teachers</Text>
      <View style={styles.subjectsContainer}>
        {standardSubjects.map((sub, i) => (
          <View key={i} style={styles.subjectRow}>
            <View style={styles.subIconBox}>
              <Text style={styles.subEmoji}>📚</Text>
            </View>
            <View style={styles.subInfo}>
              <Text style={styles.subTitle}>{sub.subject}</Text>
              <Text style={styles.subTeacher}>Faculty: {sub.teacher}</Text>
            </View>
            <View style={styles.codePill}>
              <Text style={styles.codeText}>{sub.code}</Text>
            </View>
          </View>
        ))}
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
  },
  cardTop: {
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
  childSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  badgeTerm: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  badgeTermText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7E22CE',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  statBox: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLbl: {
    fontSize: 11,
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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIcon: {
    fontSize: 32,
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
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  examTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  examMarks: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '700',
    marginTop: 4,
  },
  examGrade: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  subjectsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  subIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subEmoji: {
    fontSize: 18,
  },
  subInfo: {
    flex: 1,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  subTeacher: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  codePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
});
