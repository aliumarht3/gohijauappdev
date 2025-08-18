import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomAlert from '../../components/molecules/CustomAlert';
import { useUser } from '../../services/userService';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loadUserProfile, justLogout } = useUser();
  const [alertVisible, setAlertVisible] = useState(false);
    const resetOnboarding = async () => {
    await AsyncStorage.removeItem('hasSeenOnboarding');
    router.replace('/OnboardingScreen');
  };
  const handleLogout = async () => {
      try {
      await justLogout();
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

      <Text style={styles.comingSoon}>
        User profile modification is coming soon 🚀
      </Text>
         <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      {process.env.NODE_ENV === "development" && (
      <View style={{ marginTop: 15 }}>
        <Button title="Reset Onboarding" onPress={resetOnboarding} />
      </View>
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
    padding: 10
  },
   logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  comingSoon: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  }
});

