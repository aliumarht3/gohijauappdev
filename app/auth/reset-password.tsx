import SubmitButton from '@/components/atoms/SubmitButton';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../services/languageService';
import { useUser } from '../../services/userService';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const { resetPassword, validateResetToken } = useUser();
  const { t } = useLanguage();

  // Validate token when component mounts
  useEffect(() => {
    const checkTokenValidity = async () => {
      if (!token) {
        Alert.alert(t.common.error, t.auth.resetPassword.noToken);
        router.replace('/auth/forgot-password');
        return;
      }

      setValidatingToken(true);
      try {
        const isValid = await validateResetToken(token as string);
        if (isValid) {
          setTokenValid(true);
        } else {
          Alert.alert(t.common.error, t.auth.resetPassword.invalidToken);
          router.replace('/auth/forgot-password');
        }
      } catch (error) {
        console.error('Token validation error:', error);
        Alert.alert(t.common.error, t.auth.resetPassword.tokenValidationFailed);
        router.replace('/auth/forgot-password');
      } finally {
        setValidatingToken(false);
      }
    };

    checkTokenValidity();
  }, [token]);

  const validatePasswords = () => {
    if (!password.trim() || !confirmPassword.trim()) {
      Alert.alert(t.common.error, t.auth.resetPassword.fillAllFields);
      return false;
    }
    if (password.length < 8) {
      Alert.alert(t.common.error, t.auth.resetPassword.passwordMinLength);
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert(t.common.error, t.auth.resetPassword.passwordsDoNotMatch);
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    if (!validatePasswords()) return;

    setLoading(true);
    try {
      const success = await resetPassword(token as string, password);
      if (success) {
        setResetSuccess(true);
        Alert.alert(t.common.success, t.auth.resetPassword.resetSuccess);
        setTimeout(() => {
          router.replace('/auth/login');
        }, 2000);
      } else {
        Alert.alert(t.common.error, t.auth.resetPassword.resetFailed);
      }
    } catch (error) {
      Alert.alert(t.common.error, error?.message || t.auth.resetPassword.somethingWrong);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/plantsoil.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.overlay}>
            {validatingToken ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>{t.auth.resetPassword.validatingToken}</Text>
              </View>
            ) : !tokenValid ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={80} color="#ff6b6b" />
                <Text style={styles.errorTitle}>{t.auth.resetPassword.invalidResetLink}</Text>
                <Text style={styles.errorText}>
                  {t.auth.resetPassword.invalidResetLinkMessage}
                </Text>
              </View>
            ) : resetSuccess ? (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                <Text style={styles.successTitle}>{t.auth.resetPassword.passwordResetSuccess}</Text>
                <Text style={styles.successText}>
                  {t.auth.resetPassword.canLoginNow}
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.title}>{t.auth.resetPassword.title}</Text>
                <Text style={styles.subtitle}>
                  {t.auth.resetPassword.subtitle}
                </Text>

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder={t.auth.resetPassword.newPasswordPlaceholder}
                    autoCapitalize="none"
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#ccc"
                    value={password}
                    onChangeText={setPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder={t.auth.resetPassword.confirmPasswordPlaceholder}
                    autoCapitalize="none"
                    secureTextEntry={!showConfirmPassword}
                    placeholderTextColor="#ccc"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons
                      name={showConfirmPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.hint}>
                  {t.auth.resetPassword.passwordMinLength}
                </Text>

                {loading ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                  <SubmitButton
                    title={t.auth.resetPassword.resetButton}
                    onPress={handleResetPassword}
                    backgroundColor="#388E3C"
                  />
                )}
              </>
            )}

            <TouchableOpacity onPress={() => router.replace('/auth/login')}>
              <Text style={styles.linkText}>{t.auth.resetPassword.backToLogin}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 50, 0, 0.3)',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginTop: 20,
    textAlign: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0ffe0',
    marginBottom: 30,
    textAlign: 'center',
  },
  passwordContainer: {
    width: '90%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    color: '#fff',
    paddingVertical: 0,
  },
  hint: {
    color: '#e0ffe0',
    fontSize: 13,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
  successText: {
    color: '#e0ffe0',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  linkText: {
    marginTop: 20,
    color: '#c0f0c0',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});
