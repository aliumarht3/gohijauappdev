import { Colors } from '@/constants/Colors';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { getTransaction } from '../services/transactionService';
type HistoryItem = {
  id: string;
  createdAt: string;
  oilPoured: number;
  co2Saved: number;
  pointsAwarded: number;
};

export default function OilHistoryScreen() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    useEffect(() => {
       const handleGenerateToken = async () => {
         const result = await getTransaction();
            if (Array.isArray(result)) {
            setHistory(result);
            } else {
            setHistory([]);
            }
       }; 
       handleGenerateToken();
    }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return {
      date: `${day}-${month}-${year}`,
      time: `${hours}:${minutes} ${ampm}`,
    };
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Oil Deposition History',
          headerShown: true,
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: '#2E7D32',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}
      />
      <View style={styles.container}>
        <View style={styles.card}>
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const { date, time } = formatDate(item.createdAt);
              return (
                <View style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.date}>{date}</Text>
                    <Text style={styles.time}>{time}</Text>
                  </View>
                  <Text>Oil: {item.oilPoured} L</Text>
                  <Text>CO₂ Saved: {item.co2Saved} kg</Text>
                  <Text>Points: {item.pointsAwarded}</Text>
                </View>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2E7D32',
    fontSize: 16,
  },
  historyItem: {
    paddingVertical: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  time: {
    fontWeight: 'bold',
    color:'#2E7D32',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
});
