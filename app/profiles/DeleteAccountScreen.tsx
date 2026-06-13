import GreenScreenHeader from '@/components/GreenScreenHeader';
import { DashboardTheme } from '@/constants/dashboardTheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import api from '../../api/apiClient';
import CustomAlert from '../../components/molecules/CustomAlert';
import { useLanguage } from '../../services/languageService';
import { useUser } from '../../services/userService';

export default function DeleteAccountScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { justLogout } = useUser();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await api.delete('/user/delete-account', { data: { password } });
      setAlertTitle(t.deleteAccount.successTitle);
      setAlertMessage(res.data.message || t.deleteAccount.successMessage);
      setAlertVisible(true);
    } catch (err: any) {
      setAlertTitle(t.deleteAccount.errorTitle);
      setAlertMessage(
        err.response?.data?.message || err.message || t.deleteAccount.somethingWrong,
      );
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    if (!password.trim()) {
      setAlertTitle(t.deleteAccount.errorTitle);
      setAlertMessage(t.deleteAccount.passwordRequired);
      setAlertVisible(true);
      return;
    }
    Alert.alert(t.deleteAccount.confirmTitle, t.deleteAccount.confirmMessage, [
      { text: t.deleteAccount.cancelButton, style: 'cancel' },
      { text: t.deleteAccount.deleteConfirm, style: 'destructive', onPress: handleDelete },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.screen}>
        <GreenScreenHeader title={t.deleteAccount.confirmTitle} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.label}>{t.deleteAccount.passwordLabel}</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={t.deleteAccount.passwordPlaceholder}
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={confirmDelete}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                <Text style={styles.actionButtonText}>{t.deleteAccount.deleteButton}</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={async () => {
          setAlertVisible(false);
          if (alertTitle === t.deleteAccount.successTitle) {
            await justLogout();
          }
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
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingRight: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  eyeButton: {
    padding: 8,
  },
  actionButton: {
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
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});
