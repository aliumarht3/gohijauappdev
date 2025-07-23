import { useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function SignupScreen() {
  const router = useRouter();

  const handleSignup = () => {
    // Handle signup (API call, save token)
    router.replace('/auth/login'); // After signup, go to login
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Signup Screen</Text>
      <Button title="Sign Up" onPress={handleSignup} />
    </View>
  );
}