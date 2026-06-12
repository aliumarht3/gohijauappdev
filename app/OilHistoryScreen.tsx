import { DashboardTheme } from '@/constants/dashboardTheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTransaction } from '../services/transactionService';
import { useLanguage } from '../services/languageService';

type HistoryItem = {
  id: string;
  createdAt: string;
  oilPoured: number;
  cO2Saved: number;
  pointsAwarded: number;
  points?: number;
};

const formatKg = (value: number) =>
  Number.isInteger(value) ? `${value}kg` : `${value.toFixed(1)}kg`;

const formatReward = (value: number) => `+RM${Number(value).toFixed(2)}`;

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const formatter = new Intl.DateTimeFormat('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';

  const hour = get('hour');
  const minute = get('minute');
  const dayPeriod = get('dayPeriod');
  const day = get('day');
  const month = get('month');
  const year = get('year');

  return `${hour}:${minute} ${dayPeriod}, ${day}/${month}/${year}`;
};

export default function OilHistoryScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getTransaction();
        if (!cancelled) {
          setHistory(Array.isArray(result) ? result : []);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.transactionCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.rewardAmount}>{formatReward(item.pointsAwarded)}</Text>
        <Text style={styles.dateTime}>{formatDateTime(item.createdAt)}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{t.oilHistory.ucoRecycled}</Text>
        <Text style={styles.detailValue}>{formatKg(item.oilPoured)}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{t.oilHistory.co2Saved}</Text>
        <Text style={styles.detailValue}>{formatKg(item.cO2Saved)}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{t.oilHistory.points}</Text>
        <Text style={styles.detailValue}>
          {Math.round(item.points ?? item.pointsAwarded)}
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.screen}>
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel={t.common.back}
            >
              <Ionicons name="arrow-back" size={22} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t.oilHistory.title}</Text>
            <View style={styles.headerSpacer} />
          </View>
        </SafeAreaView>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={DashboardTheme.walletGreen} />
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>{t.oilHistory.empty}</Text>
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: DashboardTheme.screenBg,
  },
  headerSafeArea: {
    backgroundColor: DashboardTheme.headerGreen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: DashboardTheme.headerGreen,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: DashboardTheme.textOnGreen,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  listSeparator: {
    height: 12,
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: DashboardTheme.borderLight,
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  rewardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DashboardTheme.walletGreen,
  },
  dateTime: {
    fontSize: 13,
    color: '#5B6B73',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 15,
    color: '#1a1a1a',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: DashboardTheme.walletGreen,
  },
  emptyText: {
    textAlign: 'center',
    color: '#5B6B73',
    fontSize: 15,
    marginTop: 40,
  },
});
