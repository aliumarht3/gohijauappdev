import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
export default function MapScreen({ navigation }: any) {
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // Example collection point
  const collectionPoint = {
    name: 'ATIA ROBOTICS SDN BHD',
    latitude: 2.9317910599413604,
    longitude: 101.76551866598591,
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
      setLoading(false);
    })();
  }, []);

  const handleNavigation = async () => {
    Alert.alert(
      'Choose Navigation App',
      `Navigate to ${collectionPoint.name}`,
      [
        {
          text: 'Waze',
          onPress: async () => {
            const url = `waze://?ll=${collectionPoint.latitude},${collectionPoint.longitude}&navigate=yes`;
            const supported = await Linking.canOpenURL(url);
            if (supported) {
              Linking.openURL(url);
            } else {
              Alert.alert('Waze not installed', 'Please install Waze or use Google Maps instead.');
            }
          },
        },
        {
          text: 'Google Maps',
          onPress: () => {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${collectionPoint.latitude},${collectionPoint.longitude}`;
            Linking.openURL(url);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="green" />
        <Text>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || collectionPoint.latitude,
          longitude: location?.longitude || collectionPoint.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {location && (
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title="Your Location"
            pinColor="blue"
          />
        )}
        <Marker
          coordinate={{ latitude: collectionPoint.latitude, longitude: collectionPoint.longitude }}
          title={collectionPoint.name}
          description="Nearest oil recycling location"
        />
      </MapView>

      {/* Back Button Overlay */}
      <TouchableOpacity style={styles.backButton} onPress={() =>router.replace('/')}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      {/* Header Overlay */}
      <View style={styles.headerOverlay}>
        <Text style={styles.headerTitle}>Nearby Collection Points</Text>
      </View>

      {/* Navigation Info */}
      <View style={styles.navigationBox}>
        <Text style={styles.placeName}>{collectionPoint.name}</Text>
        <TouchableOpacity style={styles.goButton} onPress={handleNavigation}>
          <Text style={styles.goText}>GO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  backButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    backgroundColor: 'rgba(0, 128, 0, 0.8)',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  headerOverlay: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'green' },

  navigationBox: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    elevation: 4,
  },
  placeName: { fontSize: 16, fontWeight: 'bold', color: 'green' },
  goButton: {
    backgroundColor: 'green',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  goText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
});
