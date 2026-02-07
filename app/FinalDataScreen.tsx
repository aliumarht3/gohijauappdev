import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FinalDataScreen() {
  const router = useRouter();
  const { oilPoured, pointsEarned } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Great Job! 🎉</Text>
      <View style={styles.card}>
        <Text style={styles.value}>{oilPoured} KG</Text>
        <Text style={styles.label}>Oil Amount</Text>
      </View>
      {pointsEarned != null && pointsEarned !== "" && (
        <View style={styles.card}>
          <Text style={styles.value}>+{pointsEarned}</Text>
          <Text style={styles.label}>Points Earned</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/')} // Clears stack and goes home
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f8f3',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    width: '80%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
