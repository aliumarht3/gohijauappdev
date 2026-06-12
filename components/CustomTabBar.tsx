import CustomAlert from '@/components/molecules/CustomAlert';
import { DashboardTheme } from '@/constants/dashboardTheme';
import { useQrScan } from '@/hooks/useQrScan';
import { useLanguage } from '@/services/languageService';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_ROW_HEIGHT = 56;
export const TAB_BAR_FAB_OVERFLOW = 32;

export function useBottomTabOverflow() {
  const insets = useSafeAreaInsets();
  return TAB_BAR_ROW_HEIGHT + TAB_BAR_FAB_OVERFLOW + insets.bottom;
}

type TabRouteName = 'index' | 'profile';

function getTabIcon(routeName: string, focused: boolean): keyof typeof Ionicons.glyphMap {
  if (routeName === 'profile') {
    return focused ? 'person' : 'person-outline';
  }
  return focused ? 'home' : 'home-outline';
}

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { handleScan, scanFailedVisible, setScanFailedVisible } = useQrScan();

  const tabBarHeight = TAB_BAR_ROW_HEIGHT + insets.bottom;

  const onTabPress = (routeName: string, routeKey: string, isFocused: boolean) => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const event = navigation.emit({
      type: 'tabPress',
      target: routeKey,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const onScanPress = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    handleScan();
  };

  return (
    <View style={[styles.wrapper, { height: tabBarHeight, paddingBottom: insets.bottom }]}>
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const iconName = getTabIcon(route.name as TabRouteName, isFocused);

          return (
            <React.Fragment key={route.key}>
              <PlatformPressable
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={
                  route.name === 'profile' ? t.tabs.profile : t.tabs.home
                }
                onPress={() => onTabPress(route.name, route.key, isFocused)}
                style={styles.tabButton}
              >
                <Ionicons
                  name={iconName}
                  size={28}
                  color="#fff"
                  style={!isFocused ? styles.tabIconInactive : undefined}
                />
              </PlatformPressable>
              {index === 0 && <View style={styles.fabSpacer} />}
            </React.Fragment>
          );
        })}
      </View>

      <PlatformPressable
        onPress={onScanPress}
        style={styles.fab}
        accessibilityRole="button"
        accessibilityLabel={t.home.scan}
      >
        <Ionicons name="scan-outline" size={34} color="#fff" />
      </PlatformPressable>

      <CustomAlert
        visible={scanFailedVisible}
        title={t.common.failedTitle}
        message={t.common.failedQrGeneration}
        onClose={() => setScanFailedVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: DashboardTheme.tabBarGreen,
    borderTopWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 6,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TAB_BAR_ROW_HEIGHT,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: TAB_BAR_ROW_HEIGHT,
  },
  tabIconInactive: {
    opacity: 0.75,
  },
  fabSpacer: {
    width: 88,
  },
  fab: {
    position: 'absolute',
    top: -TAB_BAR_FAB_OVERFLOW,
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: DashboardTheme.tabBarFabGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: DashboardTheme.tabBarGreen,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
