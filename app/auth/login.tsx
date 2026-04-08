import SubmitButton from '@/components/atoms/SubmitButton';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../services/languageService';
import { useUser } from '../../services/userService';

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loadUserProfile, loginUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const success = await loginUser(email, password);

      if (success) {
        router.replace('/');
      } else {
        Alert.alert(t.auth.login.loginFailed, t.auth.login.invalidCredentials);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        Alert.alert(t.auth.login.timeout, t.auth.login.timeoutMessage);
      } else {
        Alert.alert(t.auth.login.loginFailed, error?.message || t.auth.login.somethingWrong);
      }
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

            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>{t.auth.login.title}</Text>
            <Text style={styles.subtitle}>{t.auth.login.subtitle}</Text>

            <TextInput
              style={styles.input}
              placeholder={t.auth.login.emailPlaceholder}
              placeholderTextColor="#ccc"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder={t.auth.login.passwordPlaceholder}
                autoCapitalize="none"
                secureTextEntry={!showPassword}
                placeholderTextColor="#ccc"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <SubmitButton title={t.auth.login.loginButton} onPress={handleLogin} backgroundColor="#388E3C" />
            )}
            <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
              <Text style={styles.linkText}>{t.auth.login.forgotPassword}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
              <Text style={styles.linkText}>{t.auth.login.noAccount}</Text>
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
    marginTop: -130,
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
  input: {
    width: '90%',
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#fff',
  },
  button: {
    backgroundColor: '#4CAF50',
    width: '90%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 15,
    color: '#c0f0c0',
    textDecorationLine: 'underline',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
    alignSelf: 'center',
  }
});
