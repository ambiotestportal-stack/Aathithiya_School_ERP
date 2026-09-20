import React from 'react';
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

export const ProfileScreen = () => {
  const { user, selectedStudent, children, setSelectedStudent, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to log out of Parent Portal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'P'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Parent User'}</Text>
        <Text style={styles.userRole}>Guardian / Parent Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Child Selector Card (if multiple children) */}
        {children && children.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Registered Wards / Children</Text>
            {children.map((child) => {
              const isSelected = selectedStudent?.id === child.id;
              return (
                <TouchableOpacity
                  key={child.id}
                  style={[styles.childOption, isSelected && styles.childOptionActive]}
                  onPress={() => setSelectedStudent(child)}
                >
                  <View style={styles.childIcon}>
                    <Text style={{ fontSize: 18 }}>🎓</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childMeta}>
                      Class {child.grade}-{child.section} • Roll: {child.rollNo}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={styles.activeCheck}>
                      <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Selected Student Information */}
        {selectedStudent && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Student Profile Info</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Admission No</Text>
              <Text style={styles.infoValue}>{selectedStudent.admissionNo}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>{selectedStudent.dob || '14 March 2011'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Blood Group</Text>
              <Text style={styles.infoValue}>{selectedStudent.bloodGroup || 'O+ Positive'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Class Teacher</Text>
              <Text style={styles.infoValue}>Mrs. S. Priya (M.Sc., B.Ed)</Text>
            </View>
          </View>
        )}

        {/* Contact & Guardian Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Parent Contact Details</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Primary Phone</Text>
            <Text style={styles.infoValue}>{user?.phone || '+91 98401 23456'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email Address</Text>
            <Text style={styles.infoValue}>{user?.email || 'parent.murugan@gmail.com'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Residential Address</Text>
            <Text style={styles.infoValue}>Plot 42, 2nd Main Road, Anna Nagar, Chennai</Text>
          </View>
        </View>

        {/* App Settings & Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Settings</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => Alert.alert('Push Notifications', 'Notification settings enabled.')}
          >
            <Text style={styles.settingText}>🔔 Push Notifications</Text>
            <Text style={styles.settingSub}>Enabled</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => Alert.alert('Help & Support', 'Call School Office: +91 44 2626 0000')}
          >
            <Text style={styles.settingText}>🎧 School Helpdesk & Support</Text>
            <Text style={styles.settingSub}>Contact</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>🚪 Log Out from Parent Portal</Text>
        </TouchableOpacity>
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
    paddingTop: 24,
    paddingBottom: 28,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userRole: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
  },
  childOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  childOptionActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  childIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  childName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  childMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  activeCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    maxWidth: '60%',
    textAlign: 'right',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  settingSub: {
    fontSize: 12,
    color: '#64748B',
  },
  logoutBtn: {
    backgroundColor: '#FCE8E6',
    borderWidth: 1,
    borderColor: '#FAD2CF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutBtnText: {
    color: '#C5221F',
    fontSize: 15,
    fontWeight: '700',
  },
});
