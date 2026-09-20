import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

interface SubjectMark {
  subject: string;
  maxMarks: number;
  marksObtained: number;
  grade: string;
  status: 'Pass' | 'Fail';
}

interface ExamTerm {
  id: string;
  title: string;
  date: string;
  overallPercentage: number;
  grade: string;
  rank: string;
  teacherRemarks: string;
  subjects: SubjectMark[];
}

export const AcademicScreen = () => {
  const { selectedStudent } = useAuth();
  const [selectedTermIndex, setSelectedTermIndex] = useState(0);

  const examTerms: ExamTerm[] = [
    {
      id: 't1',
      title: 'Term 1 Mid-Year Examination 2026',
      date: 'August 2026',
      overallPercentage: 91.4,
      grade: 'A+',
      rank: '3rd in Class',
      teacherRemarks: 'Karthik exhibits exceptional problem-solving skills in Mathematics and Science. Keep up the active participation in discussions!',
      subjects: [
        { subject: 'Mathematics', maxMarks: 100, marksObtained: 96, grade: 'O', status: 'Pass' },
        { subject: 'Physics', maxMarks: 100, marksObtained: 92, grade: 'A+', status: 'Pass' },
        { subject: 'Chemistry', maxMarks: 100, marksObtained: 88, grade: 'A', status: 'Pass' },
        { subject: 'English', maxMarks: 100, marksObtained: 90, grade: 'A+', status: 'Pass' },
        { subject: 'Computer Science', maxMarks: 100, marksObtained: 95, grade: 'O', status: 'Pass' },
        { subject: 'Social Studies', maxMarks: 100, marksObtained: 87, grade: 'A', status: 'Pass' },
      ],
    },
    {
      id: 't2',
      title: 'Quarterly Evaluation Test',
      date: 'June 2026',
      overallPercentage: 88.5,
      grade: 'A',
      rank: '5th in Class',
      teacherRemarks: 'Good performance overall. Focus on improving diagram representation in Chemistry.',
      subjects: [
        { subject: 'Mathematics', maxMarks: 100, marksObtained: 90, grade: 'A+', status: 'Pass' },
        { subject: 'Physics', maxMarks: 100, marksObtained: 85, grade: 'A', status: 'Pass' },
        { subject: 'Chemistry', maxMarks: 100, marksObtained: 82, grade: 'A', status: 'Pass' },
        { subject: 'English', maxMarks: 100, marksObtained: 92, grade: 'A+', status: 'Pass' },
        { subject: 'Computer Science', maxMarks: 100, marksObtained: 94, grade: 'O', status: 'Pass' },
        { subject: 'Social Studies', maxMarks: 100, marksObtained: 88, grade: 'A', status: 'Pass' },
      ],
    },
  ];

  const currentTerm = examTerms[selectedTermIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Academic Performance</Text>
        <Text style={styles.headerSubtitle}>
          {selectedStudent ? `${selectedStudent.name} • ${selectedStudent.grade}-${selectedStudent.section}` : 'Report Card & Marks'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Term Selection Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.termSelector}>
          {examTerms.map((term, index) => (
            <TouchableOpacity
              key={term.id}
              style={[styles.termChip, selectedTermIndex === index && styles.termChipActive]}
              onPress={() => setSelectedTermIndex(index)}
            >
              <Text style={[styles.termChipText, selectedTermIndex === index && styles.termChipTextActive]}>
                {term.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Overview Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreTop}>
            <View>
              <Text style={styles.examTitle}>{currentTerm.title}</Text>
              <Text style={styles.examDate}>{currentTerm.date}</Text>
            </View>
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeBadgeText}>{currentTerm.grade}</Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{currentTerm.overallPercentage}%</Text>
              <Text style={styles.metricLabel}>Percentage</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: '#3B82F6' }]}>{currentTerm.rank}</Text>
              <Text style={styles.metricLabel}>Class Rank</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: '#10B981' }]}>PASS</Text>
              <Text style={styles.metricLabel}>Result</Text>
            </View>
          </View>
        </View>

        {/* Teacher Remarks Box */}
        <View style={styles.remarksBox}>
          <Text style={styles.remarksTitle}>💬 Class Teacher Remarks</Text>
          <Text style={styles.remarksText}>"{currentTerm.teacherRemarks}"</Text>
        </View>

        {/* Subject Breakdown Table */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableTitle}>Subject Breakdown</Text>
          <TouchableOpacity
            onPress={() => Alert.alert('Report Card PDF', 'Downloading full report card PDF to mobile...')}
          >
            <Text style={styles.downloadLink}>📥 Download PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeadRow}>
            <Text style={[styles.headCell, { flex: 2 }]}>Subject</Text>
            <Text style={[styles.headCell, { flex: 1, textAlign: 'center' }]}>Marks</Text>
            <Text style={[styles.headCell, { flex: 1, textAlign: 'center' }]}>Grade</Text>
            <Text style={[styles.headCell, { flex: 1, textAlign: 'right' }]}>Result</Text>
          </View>

          {currentTerm.subjects.map((sub, idx) => (
            <View
              key={idx}
              style={[
                styles.tableBodyRow,
                idx === currentTerm.subjects.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={[styles.bodyCellSubject, { flex: 2 }]}>{sub.subject}</Text>
              <Text style={[styles.bodyCellMarks, { flex: 1, textAlign: 'center' }]}>
                {sub.marksObtained} / {sub.maxMarks}
              </Text>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={styles.miniGradeBadge}>
                  <Text style={styles.miniGradeText}>{sub.grade}</Text>
                </View>
              </View>
              <Text style={[styles.bodyCellPass, { flex: 1, textAlign: 'right' }]}>{sub.status}</Text>
            </View>
          ))}
        </View>
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
  termSelector: {
    marginBottom: 16,
  },
  termChip: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  termChipActive: {
    backgroundColor: '#2563EB',
  },
  termChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  termChipTextActive: {
    color: '#FFFFFF',
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  scoreTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    maxWidth: '80%',
  },
  examDate: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  gradeBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeBadgeText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
  },
  remarksBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  remarksTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  remarksText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tableTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },
  downloadLink: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  tableHeadRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  headCell: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableBodyRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  bodyCellSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  bodyCellMarks: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  miniGradeBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  miniGradeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  bodyCellPass: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
});
