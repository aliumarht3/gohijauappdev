import GreenScreenHeader from '@/components/GreenScreenHeader';
import { DashboardTheme } from '@/constants/dashboardTheme';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/apiClient';
import CustomAlert from '../../components/molecules/CustomAlert';
import { useLanguage } from '../../services/languageService';
import { useUser } from '../../services/userService';

export default function UpdateProfileScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loadUserProfile } = useUser();
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch('/user/profile', { name, email, phone });
      await loadUserProfile();
      setAlertVisible(true);
    } catch (err: any) {
      Alert.alert(t.common.error, err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.screen}>
        <GreenScreenHeader title={t.updateProfile.title} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.label}>{t.updateProfile.usernameLabel}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t.updateProfile.namePlaceholder}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>{t.updateProfile.phoneLabel}</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder={t.updateProfile.phonePlaceholder}
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>{t.updateProfile.emailLabel}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t.updateProfile.emailPlaceholder}
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>{t.updateProfile.saveChanges}</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.actionButtonOrange}
            onPress={() => router.push('/profiles/ChangePasswordScreen')}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#F59E0B" />
            <Text style={styles.actionButtonOrangeText}>{t.profile.changePassword}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButtonRed}
            onPress={() => router.push('/profiles/DeleteAccountScreen')}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={styles.actionButtonRedText}>{t.profile.deleteAccount}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <CustomAlert
        visible={alertVisible}
        title={t.updateProfile.successTitle}
        message={t.updateProfile.successMessage}
        onClose={() => {
          setAlertVisible(false);
          router.back();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: DashboardTheme.screenBg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: DashboardTheme.borderLight,
    padding: 16,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: DashboardTheme.walletGreen,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionButtonOrange: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FCD34D',
    paddingVertical: 16,
  },
  actionButtonOrangeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
  },
  actionButtonRed: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FECACA',
    paddingVertical: 16,
  },
  actionButtonRedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});
