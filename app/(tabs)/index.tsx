// app/(tabs)/index.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import HomeScreen from "../HomeScreen";
import OilCollectorHomeScreen from "../OilCollectorHomeScreen";
import TechnicianHomeScreen from "../TechnicianHomeScreen";

export default function TabIndex() {
  const [loading, setLoading] = useState(true);
  
  // --- MOCK USER ROLE START ---
  const MOCK_USER = {
    userRole: "OilCollector", // Forces the OilCollectorHomeScreen
    name: "Test Collector",
    email: "collector@test.com"
  };
  // --- MOCK USER ROLE END ---

  useEffect(() => {
    const init = async () => {
      // Simulate app loading briefly
      setTimeout(() => setLoading(false), 500);
    };
    init();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const currentUser = MOCK_USER;

  if (!currentUser) {
    return <View><Text>No user found</Text></View>;
  }

  switch (currentUser.userRole) {
    case "Technician":
      return <TechnicianHomeScreen />;
    case "OilCollector":
      return <OilCollectorHomeScreen />;
    default:
      return <HomeScreen />;
  }
}