import GreenScreenHeader from '@/components/GreenScreenHeader';
import { DashboardTheme } from '@/constants/dashboardTheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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

export default function ChangePasswordScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = async () => {
    if (newPassword !== confirmPassword) {
      setAlertTitle(t.changePassword.errorTitle);
      setAlertMessage(t.changePassword.passwordMismatch);
      setAlertVisible(true);
      return;
    }

    setLoading(true);
    try {
      const res = await api.patch('/user/change-password', {
        currentPassword,
        newPassword,
      });
      setAlertTitle(t.changePassword.successTitle);
      setAlertMessage(res.data.message || t.changePassword.successMessage);
      setAlertVisible(true);
    } catch (err: any) {
      setAlertTitle(t.changePassword.errorTitle);
      setAlertMessage(
        err.response?.data?.message || err.message || t.changePassword.somethingWrong,
      );
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordField = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    show: boolean,
    toggleShow: () => void,
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!show}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={toggleShow} style={styles.eyeButton}>
          <Ionicons name={show ? 'eye' : 'eye-off'} size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.screen}>
        <GreenScreenHeader title={t.changePassword.title} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {renderPasswordField(
              t.changePassword.oldPasswordLabel,
              currentPassword,
              setCurrentPassword,
              t.changePassword.currentPasswordPlaceholder,
              showOld,
              () => setShowOld((v) => !v),
            )}
            {renderPasswordField(
              t.changePassword.newPasswordLabel,
              newPassword,
              setNewPassword,
              t.changePassword.newPasswordPlaceholder,
              showNew,
              () => setShowNew((v) => !v),
            )}
            {renderPasswordField(
              t.changePassword.confirmPasswordLabel,
              confirmPassword,
              setConfirmPassword,
              t.changePassword.confirmPasswordPlaceholder,
              showConfirm,
              () => setShowConfirm((v) => !v),
            )}
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#F59E0B" />
            ) : (
              <>
                <Ionicons name="lock-closed-outline" size={20} color="#F59E0B" />
                <Text style={styles.actionButtonText}>{t.changePassword.changeButton}</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => {
          setAlertVisible(false);
          if (alertTitle === t.changePassword.successTitle) {
            router.back();
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
  fieldGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    marginTop: 8,
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
    borderColor: '#FCD34D',
    paddingVertical: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
  },
});
