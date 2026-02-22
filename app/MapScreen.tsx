import { fetchCollectorMachines, getCollectorMachines, getMachines } from "@/services/machine";
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import CircleProgressIndicator from "../components/CircleProgressIndicator";
import CustomAlert, { AlertButton } from '../components/molecules/CustomAlert';
import { interpolate } from '../constants/languages';
import { useLanguage } from '../services/languageService';
import { useUser } from "../services/userService";
export default function MapScreen({ navigation }: any) {
  const { t } = useLanguage();
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pointsWithDistance, setPointsWithDistance] = useState([]);
  const [collectionPoints, setCollectionPoints] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const router = useRouter();
  const mapRef = useRef(null);
  const { user } = useUser();
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert(t.map.locationDenied);
        setLoading(false);
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);

      let data;
      if (user.userRole === "OilCollector") {

        const [volume, machines] = await Promise.all([
          fetchCollectorMachines(),
          getCollectorMachines()
        ]);

        const volumeMap = volume.reduce((acc, item) => {
          acc[item.machineId] = {
            bufferVolume: item.bufferVolume,
            capacityLiters: item.capacityLiters
          };
          return acc;
        }, {});

        data = machines.map(machine => ({
          ...machine,
          bufferVolume: volumeMap[machine.machineId]?.bufferVolume ?? 0,
          capacityLiters: volumeMap[machine.machineId]?.capacityLiters ?? 0
        }));

      } else {
        data = await getMachines();
      }

      const normalizedMachines = data.map(m => ({
        ...m,
        uiStatus:
          m.status === 'DEPLOYED' || m.status === 'RUNNING'
            ? t.map.active
            : t.map.inactive,
      }));

      const mappedCollectionPoints = mapMachinesToCollectionPoints(normalizedMachines);
      setCollectionPoints(mappedCollectionPoints);
      setLoading(false);
    })();
    Animated.loop(
    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ])
  ).start();
  }, []);

  const mapMachinesToCollectionPoints = (machines) => {
    return machines
      .map((m) => {
        const coords = parseCoordinates(m.location?.coordinates);
        if (!coords) return null; // skip invalid

        return {
          id: m.id,
          name: m.location?.name ?? m.machineId,
          latitude: coords.latitude,
          longitude: coords.longitude,
          machineId: m.machineId,
          uiStatus: m.uiStatus,
          address: `${m.location?.unitNo ?? ''}, ${m.location?.street ?? ''}, ${m.location?.postcode ?? ''}, ${m.location?.district ?? ''}, ${m.location?.state ?? ''}, ${m.location?.country ?? ''}`,
          ...(user.userRole === "OilCollector" && {
            bufferVolume: m.bufferVolume,
            capacityLiters: m.capacityLiters,
          })
        };
      })
      .filter(Boolean);
  };

  const parseCoordinates = (coordString) => {
    if (!coordString) return null;

    const [lat, lng] = coordString
      .split(',')
      .map((v) => parseFloat(v.trim()));

    if (isNaN(lat) || isNaN(lng)) return null;

    return { latitude: lat, longitude: lng };
  };
  useEffect(() => {
  if (!location || collectionPoints.length === 0) return;

  const updatedPoints = collectionPoints
    .map((point) => ({
      ...point,
      distance: getDistanceKm(
        location.latitude,
        location.longitude,
        point.latitude,
        point.longitude
      ),
    }))
    .sort((a, b) => a.distance - b.distance); // nearest first

  setPointsWithDistance(updatedPoints);
}, [collectionPoints, location]);

  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const zoomToMarker = (item) => {
    setSelectedId(item.id);

    mapRef.current?.animateToRegion(
      {
        latitude: item.latitude,
        longitude: item.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
  };

  const handleNavigation = (point) => {
    setSelectedPoint(point);
    setAlertVisible(true);
  };

  const openWaze = async () => {
    if (!selectedPoint) return;

    const url = `waze://?ll=${selectedPoint.latitude},${selectedPoint.longitude}&navigate=yes`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert(t.map.wazeNotInstalled);
    }

    setAlertVisible(false);
  };

  const openGoogleMaps = () => {
    if (!selectedPoint) return;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPoint.latitude},${selectedPoint.longitude}`;
    Linking.openURL(url);
    setAlertVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="green" />
        <Text>{t.map.loadingMap}</Text>
      </View>
    );
  }

  return (
      <View style={styles.container}>
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location?.latitude || collectionPoints[0].latitude,
              longitude: location?.longitude || collectionPoints[0].longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {location && (
              <Marker
                coordinate={location}
                title={t.map.yourLocation}
                pinColor="blue"
              />
            )}

            {pointsWithDistance.map((point) => (
              <Marker
                key={point.id}
                coordinate={{
                  latitude: point.latitude,
                  longitude: point.longitude,
                }}
                title={point.name}
                description={interpolate(t.map.kmAway, { distance: point.distance.toFixed(2) })}
                pinColor={selectedId === point.id ? 'blue' : 'red'}
              />
            ))}
          </MapView>
        </View>
        {/* Back Button Overlay */}
        <TouchableOpacity style={styles.backButton} onPress={() =>router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Header Overlay */}
        <View style={styles.headerOverlay}>
          <Text style={styles.headerTitle}>{t.map.title}</Text>
        </View>

        <CustomAlert
          visible={alertVisible}
          title={"alertTitle"}
          message={"alertMessage"}
          onClose={() =>{setAlertVisible(false);
          }}
        />
        <CustomAlert
          visible={alertVisible}
          title={t.map.chooseNavApp}
          onClose={() => setAlertVisible(false)}
          renderContent={() => (
            <>
              <Text style={styles.message}>
                {interpolate(t.map.navigateTo, { name: selectedPoint?.name || '' })}
              </Text>

              {selectedPoint?.address && (
                <Text style={styles.placeAddress}>
                  {selectedPoint.address}
                </Text>
              )}

              <AlertButton
                label={t.map.waze}
                color="#4CAF50"
                onPress={openWaze}
              />

              <AlertButton
                label={t.map.googleMaps}
                color="#4285F4"
                onPress={openGoogleMaps}
              />

              <AlertButton
                label={t.common.cancel}
                color="#9E9E9E"
                onPress={() => setAlertVisible(false)}
              />
            </>
          )}
        />

        {/* Navigation Info */}
        <View style={styles.listContainer}>
          <FlatList
            data={pointsWithDistance}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => zoomToMarker(item)}
              >
                <View style={styles.listItem}>
                  <View style={styles.textContainer}>
                    <Text
                        style={styles.placeName}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                      {item.name}
                    </Text>
                    <Text style={styles.distanceText}>
                      {interpolate(t.map.kmAway, { distance: item.distance.toFixed(2) })}
                    </Text>
                    <View style={styles.statusRow}>
                      {item.bufferVolume != null && (
                        <CircleProgressIndicator
                          bufferVolume={item.bufferVolume}
                          capacityLiters={item.capacityLiters}
                        />
                      )}
                      <Text
                        style={[
                          styles.statusText,
                          item.uiStatus === t.map.active
                            ? styles.activeStatus
                            : styles.inactiveStatus,
                          { marginLeft: 8 },
                        ]}
                      >
                        {item.uiStatus}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.goButton}
                    onPress={() => handleNavigation(item)}
                  >
                    <Text style={styles.goText}>{t.map.go}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  mapContainer: {
    flex: 6, // 60%
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },

  listContainer: {
    flex: 4, // 40%
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 10,
    elevation: 8,
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    flexShrink: 1,
  },
  distanceText: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },

  goButton: {
    backgroundColor: 'green',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  goText: {
    color: 'white',
    fontWeight: 'bold',
  },
  placeAddress: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
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
  statusText: {
  fontSize: 12,
  marginTop: 6,
  fontWeight: '600',
  alignSelf: 'flex-start',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 6,
  borderWidth: 1,
},

activeStatus: {
  color: 'green',
  borderColor: 'green',
  backgroundColor: 'rgba(0, 128, 0, 0.08)',
},

inactiveStatus: {
  color: 'red',
  borderColor: 'red',
  backgroundColor: 'rgba(255, 0, 0, 0.08)',
},
statusRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 6,
}

});
