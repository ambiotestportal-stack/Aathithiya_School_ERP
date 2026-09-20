import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { AuthProvider } from './context/AuthContext';
import { RootNavigator } from './navigation/RootNavigator';

export const App = () => {
  return (
    <AuthProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1E293B" />
        <RootNavigator />
      </View>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});

export default App;
