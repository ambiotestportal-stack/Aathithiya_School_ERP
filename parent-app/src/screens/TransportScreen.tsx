import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

export const TransportScreen = ({ navigation }: any) => {
  const { selectedStudent } = useAuth();
  const [loading, setLoading] = useState(false);
  const [transportData, setTransportData] = useState<any>(null);

  useEffect(() => {
    fetchTransportRealData();
  }, [selectedStudent]);

  const fetchTransportRealData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/transport').catch(() => ({ data: [] }));
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        // Find vehicle allocated to this student if any
        const studentId = selectedStudent?.id || (selectedStudent as any)?._id;
        const myVehicle = res.data.find((v: any) =>
          v.assignedStudents?.some((s: any) => (s._id || s) === studentId)
        ) || res.data[0];

        setTransportData(myVehicle);
      } else {
        setTransportData(null);
      }
    } catch (e) {
      console.log('Error fetching transport data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string, role: string) => {
    Alert.alert(
      'Contact Staff',
      `Call ${role} at ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Error', 'Calling unavailable')),
        },
      ]
    );
  };

  const isBusAllocated = selectedStudent?.busRoute?.includes('Route') || transportData;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTransportRealData} colors={['#F59E0B']} />}
    >
      {/* Student Transport Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.cardSub}>ALLOCATED TRANSPORT</Text>
            <Text style={styles.busNo}>
              {transportData?.vehicleNumber || transportData?.name || 'Bus #14 (Route 14)'}
            </Text>
            <Text style={styles.regNo}>
              {transportData?.registrationNumber || 'TN-38-AB-9876'}
            </Text>
          </View>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>GPS Active</Text>
          </View>
        </View>

        <View style={styles.routeBox}>
          <Text style={styles.routeLabel}>Route:</Text>
          <Text style={styles.routeName}>
            {transportData?.route || selectedStudent?.busRoute || 'Anna Nagar - School Express'}
          </Text>
        </View>
      </View>

      {/* Schedule Stops */}
      <Text style={styles.sectionHeading}>Stop Schedule</Text>
      <View style={styles.scheduleGrid}>
        <View style={styles.scheduleItem}>
          <View style={styles.iconCircle}>
            <Text style={styles.circleEmoji}>🌅</Text>
          </View>
          <View style={styles.scheduleDetails}>
            <Text style={styles.scheduleType}>Morning Pick-Up</Text>
            <Text style={styles.stopName}>Anna Nagar Roundtana Stop</Text>
            <Text style={styles.timeTag}>07:45 AM</Text>
          </View>
        </View>

        <View style={styles.itemDivider} />

        <View style={styles.scheduleItem}>
          <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
            <Text style={styles.circleEmoji}>🌇</Text>
          </View>
          <View style={styles.scheduleDetails}>
            <Text style={styles.scheduleType}>Evening Drop-Off</Text>
            <Text style={styles.stopName}>Anna Nagar Roundtana Stop</Text>
            <Text style={styles.timeTag}>04:30 PM</Text>
          </View>
        </View>
      </View>

      {/* Driver & Staff Contacts */}
      <Text style={styles.sectionHeading}>Assigned Staff Contacts</Text>
      <View style={styles.staffCard}>
        <View style={styles.staffRow}>
          <View style={styles.staffAvatar}>
            <Text style={styles.staffEmoji}>👨‍✈️</Text>
          </View>
          <View style={styles.staffInfo}>
            <Text style={styles.staffName}>{transportData?.driverName || 'Sundaram M'}</Text>
            <Text style={styles.staffRole}>Vehicle Driver</Text>
            <Text style={styles.staffPhone}>{transportData?.driverPhone || '+91 98765 43210'}</Text>
          </View>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCall(transportData?.driverPhone || '+919876543210', 'Driver')}
          >
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.staffDivider} />

        <View style={styles.staffRow}>
          <View style={[styles.staffAvatar, { backgroundColor: '#F3E8FF' }]}>
            <Text style={styles.staffEmoji}>👮</Text>
          </View>
          <View style={styles.staffInfo}>
            <Text style={styles.staffName}>Ramesh R</Text>
            <Text style={styles.staffRole}>Bus Attendant / Helper</Text>
            <Text style={styles.staffPhone}>+91 98765 43211</Text>
          </View>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCall('+919876543211', 'Attendant')}
          >
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>
        </View>
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
  statusCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardSub: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.0,
  },
  busNo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  regNo: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  liveText: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: '800',
  },
  routeBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
  },
  routeLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  routeName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  scheduleGrid: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  circleEmoji: {
    fontSize: 20,
  },
  scheduleDetails: {
    flex: 1,
  },
  scheduleType: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  stopName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  timeTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 2,
  },
  staffCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  staffDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  staffAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  staffEmoji: {
    fontSize: 22,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  staffRole: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  staffPhone: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
    marginTop: 1,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  callIcon: {
    fontSize: 18,
  },
});
