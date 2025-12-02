import { Colors } from '@/constants/Colors';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { getTransaction } from '../services/transactionService';
type CollectorHistoryItem = {
    id: string;
    createdAt: string;
    oilCollected: number;
    cO2Saved: number;
};
export default function CollectorTransactionScreen() {
    const [history, setHistory] = useState<CollectorHistoryItem[]>([]);
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

        // Convert to Malaysia timezone (Asia/Kuala_Lumpur)
        const options: Intl.DateTimeFormatOptions = {
            timeZone: 'Asia/Kuala_Lumpur',
            hour12: true,
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        };

        const formatted = new Intl.DateTimeFormat('en-MY', options).format(date);
        const [datePart, timePart] = formatted.split(',').map(s => s.trim());

        return {
            date: datePart, // e.g. "25/10/2025"
            time: timePart, // e.g. "08:30 PM"
        };
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Oil Collection History',
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
                                    <Text>Oil: {item.oilCollected} kg</Text>
                                    <Text>CO₂ Saved: {item.cO2Saved} kg</Text>
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
        color: '#2E7D32',
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 8,
    },
});
