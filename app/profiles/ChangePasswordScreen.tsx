import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from '../../api/apiClient';
import CustomAlert from '../../components/molecules/CustomAlert';
import { useLanguage } from '../../services/languageService';
import theme from "../themes/theme";

export default function ChangePasswordScreen() {
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const handleSave = async () => {
    if (newPassword !== confirmPassword) {
      setAlertTitle(t.changePassword.errorTitle);
      setAlertMessage(t.changePassword.passwordMismatch);
      setAlertVisible(true);
      return;
    }

    setLoading(true);
    const payload = {
      currentPassword,
      newPassword
    };
    
    try {
      const res = await api.patch('/user/change-password', payload);
      setAlertTitle(t.changePassword.successTitle);
      setAlertMessage(res.data.message || t.changePassword.successMessage);
      setAlertVisible(true);
    } catch (err: any) {
      setAlertTitle(t.changePassword.errorTitle);
      setAlertMessage(err.response?.data?.message || err.message || t.changePassword.somethingWrong);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t.changePassword.title,
          headerBackTitle: t.changePassword.backTitle,
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
                    title={alertTitle}
                    message={alertMessage}
                    onClose={() =>{setAlertVisible(false); 
                      if (alertTitle === t.changePassword.successTitle) {
                        router.back();
                      }
                    }}
                  />
      <View style={styles.container}>

        <Text style={styles.label}>{t.changePassword.currentPasswordLabel}</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder={t.changePassword.currentPasswordPlaceholder}
            value={currentPassword}
            autoCapitalize="none"
            secureTextEntry={!showCurrentPassword}
            onChangeText={setCurrentPassword}
            style={styles.input}
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
            <Ionicons 
              name={showCurrentPassword ? 'eye' : 'eye-off'} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>{t.changePassword.newPasswordLabel}</Text>
        <View style={styles.passwordContainer}>
        <TextInput
          placeholder={t.changePassword.newPasswordPlaceholder}
          value={newPassword}
          autoCapitalize="none"
          secureTextEntry={!showNewPassword}
          onChangeText={setNewPassword}
          style={styles.input}
          placeholderTextColor="#888"
        />
          <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
            <Ionicons 
              name={showNewPassword ? 'eye' : 'eye-off'} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.label}>{t.changePassword.confirmPasswordLabel}</Text>
        <View style={styles.passwordContainer}>
        <TextInput
          placeholder={t.changePassword.confirmPasswordPlaceholder}
          value={confirmPassword}
          autoCapitalize="none"
          secureTextEntry={!showConfirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          placeholderTextColor="#888"
        />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons 
              name={showConfirmPassword ? 'eye' : 'eye-off'} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t.changePassword.changeButton}</Text>
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
  passwordContainer: {
  height: 50,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: theme.colors.inputBackground,
  borderRadius: theme.borderRadius.md,
  borderWidth: 1,
  borderColor: theme.colors.border,
  paddingHorizontal: 10,
  marginBottom: theme.spacing.md,
},
input: {
  flex: 1,
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
