import HelpCarousel, { HelpTopic } from '@/components/atoms/HelpCarousel';
import { useBottomTabOverflow } from '@/components/CustomTabBar';
import { DashboardTheme } from '@/constants/dashboardTheme';
import { interpolate } from '@/constants/languages';
import { MachineVolume } from '@/constants/Machine';
import { getCollectorCollectionStats } from '@/services/collectorService';
import { fetchCollectorMachines } from '@/services/machine';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../services/languageService';
import { useUser } from '../services/userService';

const HIGH_FILL_THRESHOLD = 70;

function machineFillPercent(m: MachineVolume) {
  // Use the telemetry metric or fallback to bufferVolume
  const rawVolume = m.metrics?.mainTankVolumeLiters || m.bufferVolume || 0;
  const trueCapacity = m.capacityLiters || 100;
  
  // Downscale from Python's 500L to true 100L capacity
  const correctedVolume = Math.max(0, (rawVolume / 500) * trueCapacity);

  return trueCapacity <= 0
    ? 0
    : Math.round((correctedVolume / trueCapacity) * 100);
}

function formatKg(value: number) {
  return Number.isInteger(value) ? `${value} KG` : `${value.toFixed(1)} KG`;
}

export default function OilCollectorHomeScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user, loadUserProfile } = useUser();
  const tabBarPadding = useBottomTabOverflow();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [collectionsTodayKg, setCollectionsTodayKg] = useState(0);
  const [collectedThisWeekKg, setCollectedThisWeekKg] = useState(0);
  const [machines, setMachines] = useState<MachineVolume[]>([]);

  const displayName = user?.name?.trim() || 'Collector';

  const loadDashboard = useCallback(async () => {
    const [stats, machineList] = await Promise.all([
      // Add a .catch() here to return dummy stats if the backend is offline
      getCollectorCollectionStats().catch(() => ({ 
        collectionsTodayKg: 125.5, 
        collectedThisWeekKg: 450.2 
      })),
      fetchCollectorMachines().catch(() => [] as MachineVolume[]),
    ]);
    
    setCollectionsTodayKg(stats.collectionsTodayKg);
    setCollectedThisWeekKg(stats.collectedThisWeekKg);
    
    const sorted = [...machineList].sort(
      (a, b) => machineFillPercent(b) - machineFillPercent(a),
    );
    setMachines(sorted.slice(0, 2));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // --- COMMENT THIS OUT FOR LOCAL TESTING ---
      // await loadUserProfile();
      
      if (!cancelled) {
        await loadDashboard();
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadDashboard]); // Remove loadUserProfile from dependency array

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadUserProfile();
      await loadDashboard();
    } finally {
      setRefreshing(false);
    }
  };

  const carouselTopics: HelpTopic[] = [
    {
      router: '/GetStartedScreen',
      title: t.collectorHome.adSpace,
      description: '',
      color: DashboardTheme.carouselPrimary,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: tabBarPadding }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={DashboardTheme.headerGreen}
          colors={[DashboardTheme.headerGreen]}
        />
      }
    >
      <View style={styles.heroSection}>
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>
                {interpolate(t.collectorHome.greeting, { name: displayName })}
              </Text>
              <Text style={styles.subtitle}>{t.collectorHome.subtitle}</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/(tabs)/profile')}
              accessibilityRole="button"
            >
              <Ionicons name="person" size={22} color="#333" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View style={styles.statsSection}>
          {loading ? (
            <ActivityIndicator color="#fff" style={{ marginVertical: 24 }} />
          ) : (
            <>
              <Text style={styles.statsLabel}>{t.collectorHome.collectionsToday}</Text>
              <Text style={styles.statsValue}>{formatKg(collectionsTodayKg)}</Text>
              <Text style={styles.statsSubtext}>
                {interpolate(t.collectorHome.collectedThisWeek, {
                  amount: Number.isInteger(collectedThisWeekKg)
                    ? String(collectedThisWeekKg)
                    : collectedThisWeekKg.toFixed(1),
                })}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.bodyContent}>
        <View style={styles.quickActionRow}>
          <TouchableOpacity
            style={styles.machineListCard}
            onPress={() => router.push('/CollectorMachinesScreen')}
            accessibilityRole="button"
          >
            <Text style={styles.machineListTitle}>{t.collectorHome.machineList}</Text>
            {machines.length === 0 ? (
              <Text style={styles.machineEmpty}>
                {loading ? '...' : t.collectorMachines.noMachines}
              </Text>
            ) : (
              machines.map((m, index) => {
                const pct = machineFillPercent(m);
                const isHigh = pct >= HIGH_FILL_THRESHOLD;
                return (
                  <View
                    key={m.id}
                    style={[styles.machinePill, index > 0 && styles.machinePillSpacing]}
                  >
                    <Text
                      style={[
                        styles.machinePct,
                        { color: isHigh ? '#F59E0B' : DashboardTheme.walletGreen },
                      ]}
                    >
                      {pct}%
                    </Text>
                    <Text style={styles.machineLocation} numberOfLines={1}>
                      {m.machineLocationName || m.machineId}
                    </Text>
                  </View>
                );
              })
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nearbyCard}
            onPress={() => router.push('/MapScreen')}
            accessibilityRole="button"
          >
            <Image
              source={require('../assets/images/mapbackground.jpg')}
              style={styles.nearbyMapPreview}
            />
            <Text style={styles.nearbyCardText}>{t.collectorHome.nearby}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.carouselSection}>
          <HelpCarousel topics={carouselTopics} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DashboardTheme.screenBg,
  },
  heroSection: {
    backgroundColor: DashboardTheme.headerGreen,
  },
  headerSafeArea: {
    backgroundColor: DashboardTheme.headerGreen,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DashboardTheme.textOnGreen,
  },
  subtitle: {
    fontSize: 14,
    color: DashboardTheme.textOnGreenMuted,
    marginTop: 6,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsSection: {
    backgroundColor: DashboardTheme.impactGreen,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  statsLabel: {
    fontSize: 14,
    color: DashboardTheme.textOnGreenMuted,
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: DashboardTheme.textOnGreen,
  },
  statsSubtext: {
    fontSize: 15,
    fontWeight: '600',
    color: DashboardTheme.textOnGreen,
    marginTop: 10,
    textAlign: 'center',
  },
  bodyContent: {
    paddingTop: 20,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  machineListCard: {
    flex: 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: DashboardTheme.borderLight,
    padding: 14,
    minHeight: 130,
  },
  machineListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  machineEmpty: {
    fontSize: 13,
    color: '#6B7280',
  },
  machinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  machinePillSpacing: {
    marginTop: 8,
  },
  machinePct: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  machineLocation: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  nearbyCard: {
    flex: 1,
    backgroundColor: DashboardTheme.headerGreen,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 130,
    elevation: 3,
  },
  nearbyMapPreview: {
    width: '100%',
    height: 80,
    resizeMode: 'cover',
  },
  nearbyCardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DashboardTheme.textOnGreen,
    textAlign: 'center',
    paddingVertical: 10,
  },
  carouselSection: {
    marginHorizontal: -20,
    marginTop: 4,
  },
});
