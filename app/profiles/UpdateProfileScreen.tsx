import { Colors } from '@/constants/Colors';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from '../../api/apiClient';
import CustomAlert from '../../components/molecules/CustomAlert';
import { useLanguage } from '../../services/languageService';
import { useUser } from '../../services/userService';
import theme from "../themes/theme";

export default function UpdateProfileScreen() {
  const { t } = useLanguage();
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
      Alert.alert(t.common.error, err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t.updateProfile.title,
          headerBackTitle: t.updateProfile.backTitle,
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
                    title={t.updateProfile.successTitle}
                    message={t.updateProfile.successMessage}
                    onClose={() =>{setAlertVisible(false); router.back(); }}
                  />
      <View style={styles.container}>

        <Text style={styles.label}>{t.updateProfile.nameLabel}</Text>
        <TextInput
          placeholder={t.updateProfile.namePlaceholder}
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <Text style={styles.label}>{t.updateProfile.phoneLabel}</Text>
        <TextInput
          placeholder={t.updateProfile.phonePlaceholder}
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <Text style={styles.label}>{t.updateProfile.emailLabel}</Text>
        <TextInput
          placeholder={t.updateProfile.emailPlaceholder}
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
            <Text style={styles.buttonText}>{t.updateProfile.saveChanges}</Text>
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
