// import { useRouter } from 'expo-router';
// import { Button, Text, View } from 'react-native';

// export default function SignupScreen() {
//   const router = useRouter();

//   const handleSignup = () => {
//     // Handle signup (API call, save token)
//     router.replace('/auth/login'); // After signup, go to login
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Signup Screen</Text>
//       <Button title="Sign Up" onPress={handleSignup} />
//     </View>
//   );
// }
import SubmitButton from '@/components/atoms/SubmitButton';
import Constants from "expo-constants";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const { apiBaseUrl} = Constants.expoConfig?.extra ?? {};

  const handleSignup = async () => {
    if (!name || !email || !password || !passwordConfirm || !phone) {
      Alert.alert('Missing fields', 'Please fill in all the fields.');
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }

    const signupUrl = `${apiBaseUrl}/auth/signup`;

    const payload = {
      name,
      email,
      password,
      phone,
    };
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(signupUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);  

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Signup failed (status ${response.status})`);
      }

      Alert.alert('Success', 'Account created. Please login.');
      router.replace('/auth/login');

    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        Alert.alert('Timeout', 'Request took too long. Please try again.');
      } else if (
        error.message === 'Network request failed' ||
        error.message.includes('Network')
      ) {
        Alert.alert('Network Error', 'Could not connect to the server. Please check your connection or server status.');
      } else {
        Alert.alert('Signup Failed', error.message || 'An unexpected error occurred.');
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
      <View style={styles.overlay}>
        <Text style={styles.title}>Join the Green Movement</Text>
        <Text style={styles.subtitle}>Recycle used oil & make a difference</Text>

        <TextInput 
          style={styles.input} 
          placeholder="Name"
          placeholderTextColor="#ddd"
          value={name} 
          onChangeText={setName} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Email"
          placeholderTextColor="#ddd"
          value={email} 
          onChangeText={setEmail} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Password"
          placeholderTextColor="#ddd"
          secureTextEntry
          value={password} 
          onChangeText={setPassword} 
        />
         <TextInput 
          style={styles.input} 
          placeholder="Password"
          placeholderTextColor="#ddd"
          secureTextEntry
          value={passwordConfirm} 
          onChangeText={setPasswordConfirm} 
        />
         <TextInput 
          style={styles.input} 
          placeholder="Phone Number"
          placeholderTextColor="#ddd"
          value={phone} 
          onChangeText={setPhone} 
        />
        <SubmitButton title="Sign Up" onPress={handleSignup} backgroundColor="#66BB6A" />

        <TouchableOpacity onPress={() => router.replace('/auth/login')}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
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