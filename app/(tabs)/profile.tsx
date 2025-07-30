import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
      const handleLogout = () => {
    // Implement your logout logic here (e.g., clear tokens, navigate to login)
    console.log('User logged out');
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>John Doe</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>john@example.com</Text>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>+60123456789</Text>
      </View>
         <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
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

