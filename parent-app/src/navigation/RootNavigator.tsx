import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

// Import Screens
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { AttendanceScreen } from '../screens/AttendanceScreen';
import { FeesScreen } from '../screens/FeesScreen';
import { AcademicScreen } from '../screens/AcademicScreen';
import { TransportScreen } from '../screens/TransportScreen';
import { LeaveScreen } from '../screens/LeaveScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

type TabName = 'Home' | 'Attendance' | 'Fees' | 'Academic' | 'Transport' | 'Leave' | 'Profile';

export const RootNavigator = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabName>('Home');

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Connecting to Parent Portal...</Text>
      </View>
    );
  }

  // Auth Guard
  if (!user) {
    return <LoginScreen />;
  }

  const navigateTo = (tabName: TabName) => {
    setActiveTab(tabName);
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <DashboardScreen navigation={{ navigate: navigateTo }} />;
      case 'Attendance':
        return <AttendanceScreen navigation={{ navigate: navigateTo }} />;
      case 'Fees':
        return <FeesScreen />;
      case 'Academic':
        return <AcademicScreen />;
      case 'Transport':
        return <TransportScreen />;
      case 'Leave':
        return <LeaveScreen />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <DashboardScreen navigation={{ navigate: navigateTo }} />;
    }
  };

  const tabs: { name: TabName; icon: string; label: string }[] = [
    { name: 'Home', icon: '🏠', label: 'Home' },
    { name: 'Attendance', icon: '📅', label: 'Attendance' },
    { name: 'Fees', icon: '💰', label: 'Fees' },
    { name: 'Academic', icon: '📖', label: 'Academic' },
    { name: 'Transport', icon: '🚌', label: 'Transport' },
    { name: 'Leave', icon: '📝', label: 'Leave' },
    { name: 'Profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <View style={styles.container}>
      {/* Screen Body */}
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>

      {/* Bottom Navigation Bar */}
      <SafeAreaView style={styles.tabBarWrapper}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab.name)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconCircle,
                    isActive && styles.iconCircleActive,
                  ]}
                >
                  <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                    {tab.icon}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    isActive && styles.tabLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 12,
  },
  screenContainer: {
    flex: 1,
  },
  tabBarWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -3 },
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleActive: {
    backgroundColor: '#EFF6FF',
  },
  tabIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1.0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
});
