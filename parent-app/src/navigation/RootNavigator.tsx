import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useAuth, StudentChild } from '../context/AuthContext';

// Import Screens
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { AttendanceScreen } from '../screens/AttendanceScreen';
import { FeesScreen } from '../screens/FeesScreen';
import { AcademicScreen } from '../screens/AcademicScreen';
import { TransportScreen } from '../screens/TransportScreen';

export type TabName = 'Home' | 'Attendance' | 'Transport' | 'Academic' | 'Fees';

export const RootNavigator = () => {
  const { user, isLoading, logout, children: childList, selectedStudent, setSelectedStudent } = useAuth();
  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const [childPickerVisible, setChildPickerVisible] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
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

  const handleChildSelect = (child: StudentChild) => {
    setSelectedStudent(child);
    setChildPickerVisible(false);
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <DashboardScreen navigation={{ navigate: navigateTo }} />;
      case 'Attendance':
        return <AttendanceScreen navigation={{ navigate: navigateTo }} />;
      case 'Transport':
        return <TransportScreen navigation={{ navigate: navigateTo }} />;
      case 'Academic':
        return <AcademicScreen navigation={{ navigate: navigateTo }} />;
      case 'Fees':
        return <FeesScreen navigation={{ navigate: navigateTo }} />;
      default:
        return <DashboardScreen navigation={{ navigate: navigateTo }} />;
    }
  };

  // Strictly 4 tabs as requested
  const tabs: { name: 'Attendance' | 'Transport' | 'Academic' | 'Fees'; icon: string; label: string }[] = [
    { name: 'Attendance', icon: '📅', label: 'Attendance' },
    { name: 'Transport', icon: '🚌', label: 'Transport' },
    { name: 'Academic', icon: '📖', label: 'Academic' },
    { name: 'Fees', icon: '💰', label: 'Fees' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Application Header */}
      <View style={styles.header}>
        {activeTab === 'Home' ? (
          <View style={styles.homeHeaderRow}>
            <View style={styles.brandingBlock}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoBadgeIcon}>🏫</Text>
              </View>
              <View>
                <Text style={styles.schoolName}>AATHITHIYA</Text>
                <Text style={styles.portalSubtitle}>Parent Portal</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              {childList.length > 1 && (
                <TouchableOpacity
                  style={styles.childPill}
                  onPress={() => setChildPickerVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.childPillText}>
                    👦 {selectedStudent?.name?.split(' ')[0] || 'Child'} ▾
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={logout}
                activeOpacity={0.7}
                accessibilityLabel="Logout"
              >
                <Text style={styles.logoutIcon}>🚪</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.subScreenHeaderRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setActiveTab('Home')}
              activeOpacity={0.7}
            >
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backBtnText}>Home</Text>
            </TouchableOpacity>

            <Text style={styles.subScreenTitle}>{activeTab}</Text>

            <View style={styles.childBadgeMini}>
              <Text style={styles.childBadgeMiniText}>
                👦 {selectedStudent?.name?.split(' ')[0] || 'Student'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Screen Body */}
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>

      {/* Bottom Navigation Bar (Strictly 4 Tabs: Attendance, Transport, Academic, Fees) */}
      <View style={styles.tabBarWrapper}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tabItem}
                onPress={() => setActiveTab(isActive ? 'Home' : tab.name)}
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
      </View>

      {/* Child Switcher Modal */}
      <Modal
        visible={childPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setChildPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setChildPickerVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Child Profile</Text>
            <FlatList
              data={childList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = selectedStudent?.id === item.id;
                return (
                  <TouchableOpacity
                    style={[styles.childOption, isSelected && styles.childOptionActive]}
                    onPress={() => handleChildSelect(item)}
                  >
                    <View style={styles.childOptionAvatar}>
                      <Text style={styles.childOptionAvatarText}>👦</Text>
                    </View>
                    <View style={styles.childOptionDetails}>
                      <Text style={[styles.childOptionName, isSelected && styles.childOptionNameActive]}>
                        {item.name}
                      </Text>
                      <Text style={styles.childOptionSub}>
                        {item.grade}-{item.section} • Roll: {item.rollNo} • Adm: {item.admissionNo}
                      </Text>
                    </View>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  homeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandingBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  logoBadgeIcon: {
    fontSize: 18,
  },
  schoolName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.8,
  },
  portalSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginRight: 8,
  },
  childPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  logoutBtn: {
    padding: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutIcon: {
    fontSize: 14,
  },
  subScreenHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 8,
  },
  backArrow: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2563EB',
    marginRight: 4,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  subScreenTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  childBadgeMini: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  childBadgeMiniText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tabBarWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginBottom: 3,
  },
  iconCircleActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1.0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  tabLabelActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  childOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  childOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  childOptionAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  childOptionAvatarText: {
    fontSize: 18,
  },
  childOptionDetails: {
    flex: 1,
  },
  childOptionName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  childOptionNameActive: {
    color: '#2563EB',
  },
  childOptionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
    marginLeft: 8,
  },
});
