import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export const TransportScreen = () => {
  const { selectedStudent } = useAuth();

  const transportInfo = {
    busNumber: 'Bus #14',
    regNo: 'TN-38-AB-9876',
    routeName: 'Route 14: Anna Nagar - School Express',
    pickupPoint: 'Anna Nagar Roundtana Stop',
    pickupTime: '07:45 AM',
    dropPoint: 'Anna Nagar Roundtana Stop',
    dropTime: '04:30 PM',
    driverName: 'Mr. M. Sundaram',
    driverPhone: '+91 9876543210',
    helperName: 'Mr. R. Ramesh',
    helperPhone: '+91 9876543211',
    status: 'In Transit',
  };

  const handleCallDriver = (phone: string, name: string) => {
    Alert.alert(
      'Call Staff',
      `Call ${name} at ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => {
            Linking.openURL(`tel:${phone}`).catch(() => {
              Alert.alert('Error', 'Unable to initiate call on device.');
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>School Transport</Text>
        <Text style={styles.headerSubtitle}>
          {selectedStudent ? `${selectedStudent.name} • ${selectedStudent.busRoute}` : 'Bus Route & Tracking'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Live Bus Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View>
              <Text style={styles.busNo}>{transportInfo.busNumber}</Text>
              <Text style={styles.regNo}>{transportInfo.regNo}</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.liveBadgeText}>{transportInfo.status}</Text>
            </View>
          </View>

          <Text style={styles.routeName}>{transportInfo.routeName}</Text>
        </View>

        {/* Pickup & Drop Timings */}
        <Text style={styles.sectionTitle}>Stop Schedule</Text>

        <View style={styles.scheduleContainer}>
          <View style={styles.scheduleBox}>
            <Text style={styles.scheduleIcon}>🚌 Morning Pick-Up</Text>
            <Text style={styles.stopName}>{transportInfo.pickupPoint}</Text>
            <Text style={styles.timeText}>{transportInfo.pickupTime}</Text>
          </View>

          <View style={styles.scheduleDivider} />

          <View style={styles.scheduleBox}>
            <Text style={styles.scheduleIcon}>🏠 Evening Drop-Off</Text>
            <Text style={styles.stopName}>{transportInfo.dropPoint}</Text>
            <Text style={styles.timeText}>{transportInfo.dropTime}</Text>
          </View>
        </View>

        {/* Staff Contact Cards */}
        <Text style={styles.sectionTitle}>Bus Driver & Staff</Text>

        {/* Driver Card */}
        <View style={styles.staffCard}>
          <View style={styles.staffAvatar}>
            <Text style={styles.avatarText}>👴</Text>
          </View>
          <View style={styles.staffInfo}>
            <Text style={styles.staffRole}>Bus Driver</Text>
            <Text style={styles.staffName}>{transportInfo.driverName}</Text>
            <Text style={styles.staffPhone}>{transportInfo.driverPhone}</Text>
          </View>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => handleCallDriver(transportInfo.driverPhone, transportInfo.driverName)}
          >
            <Text style={styles.callBtnText}>📞 Call</Text>
          </TouchableOpacity>
        </View>

        {/* Helper Card */}
        <View style={styles.staffCard}>
          <View style={[styles.staffAvatar, { backgroundColor: '#F0FDF4' }]}>
            <Text style={styles.avatarText}>🧑</Text>
          </View>
          <View style={styles.staffInfo}>
            <Text style={styles.staffRole}>Bus Attendant / Helper</Text>
            <Text style={styles.staffName}>{transportInfo.helperName}</Text>
            <Text style={styles.staffPhone}>{transportInfo.helperPhone}</Text>
          </View>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => handleCallDriver(transportInfo.helperPhone, transportInfo.helperName)}
          >
            <Text style={styles.callBtnText}>📞 Call</Text>
          </TouchableOpacity>
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
  statusCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  busNo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  regNo: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#166534',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  liveBadgeText: {
    color: '#DCFCE7',
    fontSize: 12,
    fontWeight: '700',
  },
  routeName: {
    color: '#CBD5E1',
    fontSize: 14,
    marginTop: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  scheduleContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  scheduleBox: {
    paddingVertical: 4,
  },
  scheduleIcon: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  stopName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 2,
  },
  scheduleDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  staffCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  staffAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 22,
  },
  staffInfo: {
    flex: 1,
  },
  staffRole: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  staffName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  staffPhone: {
    fontSize: 13,
    color: '#3B82F6',
    marginTop: 2,
  },
  callBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
