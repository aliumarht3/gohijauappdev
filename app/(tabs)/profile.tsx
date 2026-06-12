import BankAccountModal from '@/components/molecules/BankAccountModal';
import CustomAlert from '@/components/molecules/CustomAlert';
import { useBottomTabOverflow } from '@/components/CustomTabBar';
import { DashboardTheme } from '@/constants/dashboardTheme';
import { getBankNameByCode } from '@/constants/Banks';
import { interpolate, profileLanguageDisplay } from '@/constants/languages';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../services/languageService';
import { useUser } from '../../services/userService';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loadUserProfile, justLogout, bankAccount, hasBankAccount, refreshBank } =
    useUser();
  const { t, language } = useLanguage();
  const [alertVisible, setAlertVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const tabBarPadding = useBottomTabOverflow();

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [loadUserProfile]),
  );

  const bankBadge = useMemo(() => {
    if (!hasBankAccount || !bankAccount) return null;
    return `(${getBankNameByCode(bankAccount.bankCode) ?? bankAccount.bankCode}) • ${bankAccount.accountNumber}`;
  }, [bankAccount, hasBankAccount]);

  const languageLabel = interpolate(t.profile.languageButton, {
    language: profileLanguageDisplay[language],
  });

  const handleLogout = async () => {
    try {
      await justLogout();
    } catch {
      setAlertVisible(true);
    }
  };

  const openSettingsItem = (route: string) => {
    setSettingsOpen(false);
    router.push(route as never);
  };

  const resetOnboarding = async () => {
    await AsyncStorage.removeItem('hasSeenOnboarding');
    router.replace('/OnboardingScreen');
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.headerBar}>
          <View style={styles.headerSide} />
          <Text style={styles.headerTitle}>{t.profile.title}</Text>
          <View style={styles.headerSide}>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setSettingsOpen((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={t.profile.updateProfile}
            >
              <Ionicons name="settings-outline" size={22} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileHero}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={56} color="#333" />
          </View>
          <Text style={styles.userName}>{user?.name || '—'}</Text>
          <Text style={styles.userDetail}>{user?.email || '—'}</Text>
          <Text style={styles.userDetail}>{user?.phone || '—'}</Text>
        </View>
      </SafeAreaView>

      {settingsOpen && (
        <>
          <Pressable
            style={styles.settingsBackdrop}
            onPress={() => setSettingsOpen(false)}
          />
          <View style={styles.settingsMenu}>
            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => openSettingsItem('/profiles/UpdateProfileScreen')}
            >
              <Text style={styles.settingsItemText}>{t.profile.updateProfile}</Text>
            </TouchableOpacity>
            <View style={styles.settingsDivider} />
            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => openSettingsItem('/profiles/ChangePasswordScreen')}
            >
              <Text style={styles.settingsItemText}>{t.profile.changePassword}</Text>
            </TouchableOpacity>
            <View style={styles.settingsDivider} />
            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => openSettingsItem('/profiles/DeleteAccountScreen')}
            >
              <Text style={[styles.settingsItemText, styles.settingsDanger]}>
                {t.profile.deleteAccount}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.bodyContent, { paddingBottom: tabBarPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t.profile.defaultAccount}</Text>
          {hasBankAccount && bankBadge ? (
            <Text style={styles.bankText}>{bankBadge}</Text>
          ) : (
            <Text style={styles.bankTextMuted}>{t.withdrawal.addBankAccount}</Text>
          )}
          <TouchableOpacity
            style={styles.outlineButtonGreen}
            onPress={() => setBankModalVisible(true)}
          >
            <Text style={styles.outlineButtonGreenText}>{t.profile.changeDefault}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => router.push('/profiles/ChangeLanguageScreen')}
        >
          <Text style={styles.languageButtonText}>{languageLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t.profile.logout}</Text>
        </TouchableOpacity>

        {process.env.NODE_ENV === 'development' && (
          <View style={styles.devReset}>
            <Button title={t.profile.resetOnboarding} onPress={resetOnboarding} />
          </View>
        )}
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={t.profile.logoutFailed}
        message={t.profile.logoutFailedMessage}
        onClose={() => setAlertVisible(false)}
      />
      <BankAccountModal
        visible={bankModalVisible}
        onClose={() => setBankModalVisible(false)}
        onSaved={refreshBank}
      />
    </View>
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerSide: {
    width: 40,
    alignItems: 'flex-end',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: DashboardTheme.textOnGreen,
    textAlign: 'center',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHero: {
    alignItems: 'center',
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DashboardTheme.textOnGreen,
    marginBottom: 6,
  },
  userDetail: {
    fontSize: 14,
    color: DashboardTheme.textOnGreenMuted,
    marginBottom: 2,
  },
  settingsBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
  },
  settingsMenu: {
    position: 'absolute',
    top: 100,
    right: 16,
    zIndex: 101,
    backgroundColor: '#fff',
    borderRadius: 10,
    minWidth: 200,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    overflow: 'hidden',
  },
  settingsItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingsItemText: {
    fontSize: 15,
    color: '#1a1a1a',
  },
  settingsDanger: {
    color: '#DC2626',
  },
  settingsDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: DashboardTheme.borderLight,
    padding: 16,
  },
  cardLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  bankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DashboardTheme.walletGreen,
    marginBottom: 12,
  },
  bankTextMuted: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 12,
  },
  outlineButtonGreen: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: DashboardTheme.walletGreen,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  outlineButtonGreenText: {
    color: DashboardTheme.walletGreen,
    fontWeight: '600',
    fontSize: 14,
  },
  languageButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: DashboardTheme.borderLight,
    paddingVertical: 16,
    alignItems: 'center',
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: DashboardTheme.walletGreen,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#EF4444',
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  devReset: {
    marginTop: 8,
  },
});
