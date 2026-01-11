import SubmitButton from '@/components/atoms/SubmitButton';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUser } from '../../services/userService';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const { resetPassword } = useUser();

  const validatePasswords = () => {
    if (!password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
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
        Alert.alert('Success', 'Your password has been reset successfully');
        setTimeout(() => {
          router.replace('/auth/login');
        }, 2000);
      } else {
        Alert.alert('Error', 'Failed to reset password. Please try again or request a new reset link.');
      }
    } catch (error) {
      Alert.alert('Error', error?.message || 'Something went wrong. Please try again.');
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
            {resetSuccess ? (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                <Text style={styles.successTitle}>Password Reset Successfully!</Text>
                <Text style={styles.successText}>
                  You can now log in with your new password
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.title}>Create New Password</Text>
                <Text style={styles.subtitle}>
                  Enter a new password for your account
                </Text>

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="New Password"
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
                    placeholder="Confirm Password"
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
                  Password must be at least 8 characters long
                </Text>

                {loading ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                  <SubmitButton
                    title="Reset Password"
                    onPress={handleResetPassword}
                    backgroundColor="#388E3C"
                  />
                )}
              </>
            )}

            <TouchableOpacity onPress={() => router.replace('/auth/login')}>
              <Text style={styles.linkText}>Back to Login</Text>
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
