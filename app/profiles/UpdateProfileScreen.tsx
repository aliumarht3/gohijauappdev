import { Colors } from '@/constants/Colors';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from '../../api/apiClient';
import CustomAlert from '../../components/molecules/CustomAlert';
import { useUser } from '../../services/userService';
import theme from "../themes/theme";

export default function UpdateProfileScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, loadUserProfile } = useUser();
  const router = useRouter();
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    const payload = {
      name,
      email,
      phone,
    };
    
    try {
      const res = await api.patch('/user/profile', payload);
      
      setAlertVisible(true);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Update Profile',
          headerBackTitle: "Profile",
          headerBackButtonDisplayMode: "minimal",
          headerShown: true,
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: '#2E7D32',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}
      />
      <CustomAlert
                    visible={alertVisible}
                    title="Success!"
                    message="Profile updated successfully."
                    onClose={() =>{setAlertVisible(false); router.back(); }}
                  />
      <View style={styles.container}>

        <Text style={styles.label}>Name</Text>
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <Text style={styles.label}>Phone</Text>
        <TextInput
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#888"
          keyboardType="email-address"
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  input: {
    backgroundColor: theme.colors.inputBackground,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: theme.fontSize.md,
    fontWeight: "bold",
  },
});
