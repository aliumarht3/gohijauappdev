import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from '../../api/apiClient';
import CustomAlert from '../../components/molecules/CustomAlert';
import { useUser } from '../../services/userService';
import theme from "../themes/theme";

export default function DeleteAccountScreen() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { justLogout } = useUser();


  const handleDelete = async () => {
    setLoading(true);
    const payload = {
      password
    };
      console.log("ress: ");
    
    try {
      const res = await api.delete('/user/delete-account', {
        data: payload
    });      
      setAlertTitle("Success!");
      setAlertMessage(res.data.message || "Account Delete Successfully.");
      setAlertVisible(true);
    } catch (err: any) {
      setAlertTitle("Error!");
      setAlertMessage(err.response?.data?.message || err.message || "Something went wrong.");
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

    const confirmDelete = () => {
        if (!password.trim()) {
            setAlertTitle("Error!");
            setAlertMessage("Password is required to delete your account.");
            setAlertVisible(true);
            return;
        }
        Alert.alert(
            "Confirm Delete",
            "Are you sure to delete your account? This action cannot be undone.",
            [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: handleDelete }
            ]
        );
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
                    onClose={async () =>{setAlertVisible(false); 
                      if (alertTitle === "Success!") {
                        // router.back();
                        await justLogout();
                      }
                    }}
                  />
      <View style={styles.container}>

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            autoCapitalize="none"
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
            style={styles.input}
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons 
              name={showPassword ? 'eye' : 'eye-off'} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={confirmDelete}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Delete Account</Text>
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
    backgroundColor: '#E53935',
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
