import SubmitButton from '@/components/atoms/SubmitButton';
import { Ionicons } from '@expo/vector-icons';
import Constants from "expo-constants";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../api/apiClient';
import { useLanguage } from '../../services/languageService';
import { useUser } from '../../services/userService';

export default function SignupScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const { apiBaseUrl} = Constants.expoConfig?.extra ?? {};
  const { justLogout } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !passwordConfirm || !phone) {
      Alert.alert(t.auth.signup.missingFields, t.auth.signup.missingFieldsMessage);
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert(t.auth.signup.passwordMismatch, t.auth.signup.passwordMismatchMessage);
      return;
    }

    const payload = {
      name,
      email,
      password,
      phone,
    };
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await api.post('/auth/signup', payload);

      clearTimeout(timeoutId);  

      Alert.alert(t.common.success, t.auth.signup.accountCreated);
      await justLogout();

    } catch (err) {
      clearTimeout(timeoutId);
      const error = err instanceof Error ? err : new Error(String(err));

      if (error.name === 'AbortError') {
        Alert.alert(t.auth.signup.timeout, t.auth.signup.timeoutMessage);
      } else if (
        error.message === 'Network request failed' ||
        error.message.includes('Network')
      ) {
        Alert.alert(t.auth.signup.networkError, t.auth.signup.networkErrorMessage);
      } else {
        Alert.alert(t.auth.signup.signupFailed, error.message || t.auth.signup.unexpectedError);
      }

      console.error('Signup error:', error);
    }
  };
  return (
    <ImageBackground 
      source={require('../../assets/images/plantsink.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // adjust if needed
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.overlay}>
        <Text style={styles.title}>{t.auth.signup.title}</Text>
        <Text style={styles.subtitle}>{t.auth.signup.subtitle}</Text>

        <TextInput 
          style={styles.input} 
          placeholder={t.auth.signup.namePlaceholder}
          placeholderTextColor="#ddd"
          value={name} 
          onChangeText={setName} 
        />
        <TextInput 
          style={styles.input} 
          placeholder={t.auth.signup.emailPlaceholder}
          placeholderTextColor="#ddd"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email} 
          onChangeText={setEmail} 
        />
        <View style={styles.passwordContainer}>
          <TextInput 
            style={styles.passwordInput} 
            placeholder={t.auth.signup.passwordPlaceholder}
            autoCapitalize="none"
            placeholderTextColor="#ddd"
            secureTextEntry={!showPassword}
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
        <View style={styles.passwordContainer}>
          <TextInput 
            style={styles.passwordInput} 
            placeholder={t.auth.signup.retypePasswordPlaceholder}
            autoCapitalize="none"
            placeholderTextColor="#ddd"
            secureTextEntry={!showRetypePassword}
            value={passwordConfirm} 
            onChangeText={setPasswordConfirm} 
          />
          <TouchableOpacity onPress={() => setShowRetypePassword(!showRetypePassword)}>
            <Ionicons 
              name={showRetypePassword ? 'eye' : 'eye-off'} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>
         <TextInput 
          style={styles.input} 
          placeholder={t.auth.signup.phonePlaceholder}
          placeholderTextColor="#ddd"
          value={phone} 
          onChangeText={setPhone}
          keyboardType="numeric"
          maxLength={15}
        />
        <SubmitButton title={t.auth.signup.signupButton} onPress={handleSignup} backgroundColor="#66BB6A" />

        <TouchableOpacity onPress={()=> { router.dismissAll(); router.replace('/auth/login')}}>
          <Text style={styles.linkText}>{t.auth.signup.hasAccount}</Text>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center', // or 'flex-start' if you want top-aligned form
    padding: 20,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 50, 0, 0.4)', // dark green overlay for contrast
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#e0ffe0',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)', // semi-transparent for eco style
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#fff',
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
});
