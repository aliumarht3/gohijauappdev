import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = async () => {
    // Normally you'd call an API here and get a token
    await AsyncStorage.setItem('auth_token', 'dummy-token');
    router.replace('/'); // Redirect to main app
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Login Screen</Text>
      <Button title="Log In" onPress={handleLogin} />
    </View>
  );
}
