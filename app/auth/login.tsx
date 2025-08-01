// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter } from 'expo-router';
// import { Button, Text, View } from 'react-native';

// export default function LoginScreen() {
//   const router = useRouter();

//   const handleLogin = async () => {
//     // Normally you'd call an API here and get a token
//     await AsyncStorage.setItem('auth_token', 'dummy-token');
//     router.replace('/'); // Redirect to main app
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Login Screen</Text>
//       <Button title="Log In" onPress={handleLogin} />
//     </View>
//   );
// }
import SubmitButton from '@/components/atoms/SubmitButton';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUser } from '../../services/userService';

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loadUserProfile, loginUser } = useUser();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const success = await loginUser(email, password);
      
      if (success) {
        router.push('/');
      } else {
        Alert.alert('Login Failed', 'Invalid credentials.');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        Alert.alert('Timeout', 'The request took too long. Please try again.');
      } else {
        console.error('Login error:', error);
        Alert.alert('Login Failed', error.message || 'Something went wrong');
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
      <View style={styles.overlay}>
        <Text style={styles.title}>Recycle Used Oil</Text>
        <Text style={styles.subtitle}>Turn waste into a cleaner planet</Text>

        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          placeholderTextColor="#ccc"
          value={email} 
          onChangeText={setEmail} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Password" 
          placeholderTextColor="#ccc"
          secureTextEntry 
          value={password} 
          onChangeText={setPassword} 
        />

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
        <SubmitButton title="Login" onPress={handleLogin} backgroundColor="#388E3C" />
        )}

        <TouchableOpacity onPress={() => router.push('/auth/signup')}>
          <Text style={styles.linkText}>Don’t have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: 'rgba(0, 50, 0, 0.3)', // eco-friendly green overlay
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
});
