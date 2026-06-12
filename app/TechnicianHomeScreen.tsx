import TechnicianCarousel, {
  TechnicianCarouselSlide,
} from '@/components/atoms/TechnicianCarousel';
import { useBottomTabOverflow } from '@/components/CustomTabBar';
import CustomAlert from '@/components/molecules/CustomAlert';
import { DashboardTheme } from '@/constants/dashboardTheme';
import { interpolate } from '@/constants/languages';
import { fetchTechnicianDashboardStats } from '@/services/technicianService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

export default function TechnicianHomeScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user, loadUserProfile } = useUser();
  const tabBarPadding = useBottomTabOverflow();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalMachines, setTotalMachines] = useState(0);
  const [activeMachines, setActiveMachines] = useState(0);
  const [needsAttentionCount, setNeedsAttentionCount] = useState(0);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [notificationsAlertVisible, setNotificationsAlertVisible] = useState(false);

  const displayName = user?.name?.trim() || t.technicianHome.defaultName;

  const loadDashboard = useCallback(async () => {
    if (!user?.id) return;
    const stats = await fetchTechnicianDashboardStats(user.id);
    setTotalMachines(stats.totalMachines);
    setActiveMachines(stats.activeMachines);
    setNeedsAttentionCount(stats.needsAttentionCount);
    setLocationLabel(stats.locationLabel);
  }, [user?.id]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await loadDashboard();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, loadDashboard]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadUserProfile();
      await loadDashboard();
    } finally {
      setRefreshing(false);
    }
  };

  const carouselSlides: TechnicianCarouselSlide[] = useMemo(
    () => [
      {
        id: 'error-logs',
        title: t.technicianHome.errorLogs,
        message: t.technicianHome.comingSoonErrorLog,
      },
      {
        id: 'maintenance',
        title: t.technicianHome.maintenanceSchedule,
        message: t.technicianHome.comingSoonMaintenance,
      },
    ],
    [t],
  );

  const notificationText =
    needsAttentionCount > 0
      ? interpolate(t.technicianHome.machinesNeedAttention, {
          count: String(needsAttentionCount),
        })
      : t.technicianHome.noMachinesNeedAttention;

  const handleNotificationsPress = () => {
    if (needsAttentionCount > 0) {
      router.push('/MapScreen');
      return;
    }
    setNotificationsAlertVisible(true);
  };

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
                {interpolate(t.technicianHome.greeting, { name: displayName })}
              </Text>
              <Text style={styles.subtitle}>{t.technicianHome.subtitle}</Text>
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
              <Text style={styles.statsLabel}>{t.technicianHome.totalMachines}</Text>
              <Text style={styles.statsValue}>
                {interpolate(t.technicianHome.machinesCount, {
                  total: String(totalMachines),
                  active: String(activeMachines),
                })}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color={DashboardTheme.textOnGreenMuted} />
                <Text style={styles.locationText}>
                  {locationLabel ?? t.technicianHome.locationUnavailable}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.bodyContent}>
        <View style={styles.carouselSection}>
          <TechnicianCarousel slides={carouselSlides} />
        </View>

        <View style={styles.quickActionRow}>
          <TouchableOpacity
            style={styles.notificationsCard}
            onPress={handleNotificationsPress}
            accessibilityRole="button"
          >
            <Text style={styles.cardTitle}>{t.technicianHome.notifications}</Text>
            <View style={styles.notificationRow}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={DashboardTheme.walletGreen}
              />
              <Text style={styles.notificationText}>{notificationText}</Text>
            </View>
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
            <Text style={styles.nearbyCardText}>{t.technicianHome.nearby}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CustomAlert
        visible={notificationsAlertVisible}
        title={t.technicianHome.notifications}
        message={t.technicianHome.noMachinesNeedAttention}
        onClose={() => setNotificationsAlertVisible(false)}
      />
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
    textAlign: 'center',
  },
  statsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: DashboardTheme.textOnGreen,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  locationText: {
    fontSize: 14,
    color: DashboardTheme.textOnGreen,
    fontWeight: '600',
  },
  bodyContent: {
    paddingTop: 20,
  },
  carouselSection: {
    marginHorizontal: -20,
    marginBottom: 8,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  notificationsCard: {
    flex: 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: DashboardTheme.borderLight,
    padding: 14,
    minHeight: 130,
    justifyContent: 'flex-start',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  notificationText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
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
});
