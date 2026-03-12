import SubmitButton from '@/components/atoms/SubmitButton';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../services/languageService';
import { useUser } from '../../services/userService';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { requestPasswordReset } = useUser();

  const handleRequestReset = async () => {
    if (!email.trim()) {
      Alert.alert(t.common.error, t.auth.forgotPassword.enterEmail);
      return;
    }

    setLoading(true);
    try {
      const success = await requestPasswordReset(email);
      if (success) {
        setSubmitted(true);
        Alert.alert(t.common.success, t.auth.forgotPassword.checkEmail);
      } else {
        Alert.alert(t.common.error, t.auth.forgotPassword.unableToProcess);
      }
    } catch (error) {
      Alert.alert(t.common.error, error?.message || t.auth.forgotPassword.somethingWrong);
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.title}>{t.auth.forgotPassword.title}</Text>
            <Text style={styles.subtitle}>
              {submitted ? t.auth.forgotPassword.subtitleSubmitted : t.auth.forgotPassword.subtitleDefault}
            </Text>

            {!submitted ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder={t.auth.forgotPassword.emailPlaceholder}
                  placeholderTextColor="#ccc"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />

                {loading ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                  <SubmitButton
                    title={t.auth.forgotPassword.sendResetLink}
                    onPress={handleRequestReset}
                    backgroundColor="#388E3C"
                  />
                )}
              </>
            ) : (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
                <Text style={styles.successText}>
                  {t.auth.forgotPassword.successText}
                </Text>
                <Text style={styles.successSubtext}>
                  {t.auth.forgotPassword.spamText}
                </Text>
              </View>
            )}

            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.linkText}>{t.auth.forgotPassword.backToLogin}</Text>
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0ffe0',
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    color: '#fff',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  successSubtext: {
    color: '#e0ffe0',
    fontSize: 14,
    textAlign: 'center',
  },
  linkText: {
    marginTop: 20,
    color: '#c0f0c0',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});
