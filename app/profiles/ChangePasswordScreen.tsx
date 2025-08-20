import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from '../../api/apiClient';
import CustomAlert from '../../components/molecules/CustomAlert';
import theme from "../themes/theme";

export default function ChangePasswordScreen() {
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
      setAlertTitle("Error!");
      setAlertMessage("New password and confirm password do not match.");
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
      console.log("ress: ", res);
      
      setAlertTitle("Success!");
      setAlertMessage(res.data.message || "Password changed successfully.");
      setAlertVisible(true);
    } catch (err: any) {
      setAlertTitle("Error!");
      setAlertMessage(err.response?.data?.message || err.message || "Something went wrong.");
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Change Password',
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
                      if (alertTitle === "Success!") {
                        router.back();
                      }
                    }}
                  />
      <View style={styles.container}>

        <Text style={styles.label}>Current Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Current Password"
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

        <Text style={styles.label}>New Password</Text>
        <View style={styles.passwordContainer}>
        <TextInput
          placeholder="New Password"
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
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Confirm Password"
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
            <Text style={styles.buttonText}>Change Password</Text>
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
