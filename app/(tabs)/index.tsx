// app/(tabs)/index.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useUser } from "../../services/userService";
import HomeScreen from "../HomeScreen";
import OilCollectorHomeScreen from "../OilCollectorHomeScreen";
import TechnicianHomeScreen from "../TechnicianHomeScreen";

export default function TabIndex() {
  const { user, loadUserProfile } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await loadUserProfile();
      setLoading(false);
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

  if (!user) {
    return <View><Text>No user found</Text></View>; // or redirect to login
  }

  switch (user.role) {
    case "technician":
      return <TechnicianHomeScreen />;
    case "oil_collector":
      return <OilCollectorHomeScreen />;
    default:
      return <HomeScreen />;
  }
}
