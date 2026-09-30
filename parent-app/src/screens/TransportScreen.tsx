import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../config/api';

export const TransportScreen = () => {
  const { selectedStudent } = useAuth();
  const { socket } = useSocket();

  const [route, setRoute] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransportData();
  }, [selectedStudent]);

  useEffect(() => {
    if (!socket || !route) return;

    const handleLogAdded = (newLog: any) => {
      if ((newLog.transport?._id || newLog.transport) === route._id) {
        setLogs(prev => [newLog, ...prev]);
      }
    };

    socket.on('transport_log_added', handleLogAdded);

    return () => {
      socket.off('transport_log_added', handleLogAdded);
    };
  }, [socket, route]);

  const fetchTransportData = async () => {
    if (!selectedStudent) return;
    try {
      setLoading(true);
      const [transportsRes, logsRes] = await Promise.all([
        api.get('/api/transport'),
        api.get('/api/transport/logs')
      ]);
      
      const allTransports = transportsRes.data;
      const assignedRoute = allTransports.find((t: any) => 
        t.students.some((s: any) => (s._id || s) === selectedStudent._id || s === selectedStudent.id)
      );

      setRoute(assignedRoute || null);

      if (assignedRoute) {
        const assignedLogs = logsRes.data.filter((log: any) => 
          (log.transport?._id || log.transport) === assignedRoute._id
        );
        setLogs(assignedLogs);
      }
    } catch (error) {
      console.error('Failed to fetch transport data', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>School Transport</Text>
        <Text style={styles.headerSubtitle}>
          {selectedStudent ? `${selectedStudent.name} • ${selectedStudent.grade}-${selectedStudent.section}` : 'Bus Route & Tracking'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!route ? (
          <View style={styles.noRouteCard}>
            <Text style={styles.noRouteText}>No Transport Assigned</Text>
            <Text style={styles.noRouteSub}>This child is not currently assigned to any school bus route.</Text>
          </View>
        ) : (
          <>
            {/* Live Bus Status Card */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View>
                  <Text style={styles.busNo}>{route.vehicleNumber}</Text>
                  <Text style={styles.regNo}>Reg: {route.capacity} Seats</Text>
                </View>
                <View style={styles.liveBadge}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.liveBadgeText}>
                    {logs.length > 0 ? (logs[0].eventType === 'REACHED_SCHOOL' ? 'At School' : 'In Transit') : 'In Transit'}
                  </Text>
                </View>
              </View>

              <Text style={styles.routeName}>{route.route}</Text>
            </View>

            {/* Live Logs */}
            <Text style={styles.sectionTitle}>Live Tracking Logs</Text>
            <View style={styles.scheduleContainer}>
              {logs.length === 0 ? (
                <Text style={styles.emptyLogText}>No tracking events yet.</Text>
              ) : (
                logs.map((log, index) => {
                  const isArrival = log.eventType === 'REACHED_SCHOOL';
                  const date = new Date(log.timestamp);
                  return (
                    <View key={log._id || index}>
                      <View style={styles.logRow}>
                        <View style={[styles.logDot, { backgroundColor: isArrival ? '#22C55E' : '#F97316' }]} />
                        <View style={styles.logContent}>
                          <Text style={styles.logTitle}>
                            {isArrival ? 'Bus Reached School' : 'Bus Departed School'}
                          </Text>
                          <Text style={styles.logTime}>
                            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      </View>
                      {index < logs.length - 1 && <View style={styles.logDivider} />}
                    </View>
                  );
                })
              )}
            </View>

            {/* Staff Contact Cards */}
            <Text style={styles.sectionTitle}>Bus Driver</Text>
            <View style={styles.staffCard}>
              <View style={styles.staffAvatar}>
                <Text style={styles.avatarText}>🚌</Text>
              </View>
              <View style={styles.staffInfo}>
                <Text style={styles.staffRole}>Bus Driver</Text>
                <Text style={styles.staffName}>{route.driverName}</Text>
                <Text style={styles.staffPhone}>{route.driverContact}</Text>
              </View>
              {route.driverContact && (
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleCallDriver(route.driverContact, route.driverName)}
                >
                  <Text style={styles.callBtnText}>📞 Call</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
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
  noRouteCard: {
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
  noRouteText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
  },
  noRouteSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
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
  emptyLogText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  logDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  logContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  logTime: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  logDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
    marginLeft: 24,
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
