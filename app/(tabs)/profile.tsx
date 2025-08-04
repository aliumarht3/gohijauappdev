import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import authStorage from '../../api/authStorage';
import CustomAlert from '../../components/molecules/CustomAlert';
import { useUser } from '../../services/userService';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loadUserProfile } = useUser();
  const [alertVisible, setAlertVisible] = useState(false);
    const resetOnboarding = async () => {
    await AsyncStorage.removeItem('hasSeenOnboarding');
    router.replace('/OnboardingScreen');
  };
  const handleLogout = async () => {
      try {
      await authStorage.clear();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
      setAlertVisible(true);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.name}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{user?.phone}</Text>
      </View>
         <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      {process.env.NODE_ENV === "development" && (
      <Button title="Reset Onboarding" onPress={resetOnboarding} />
    )}
        
      <CustomAlert
        visible={alertVisible}
        title="Logout Failed!"
        message="Something went wrong during logout."
        onClose={() =>{setAlertVisible(false);} }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F8F5', // app theme
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32', // green
    textAlign: 'center',
    marginVertical: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
    logoutButton: {
    marginTop: 24,
    backgroundColor: '#E53935', // red for logout
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
   logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

