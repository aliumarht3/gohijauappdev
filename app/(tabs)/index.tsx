import HelpCarousel from '@/components/atoms/HelpCarousel';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomAlert from '../../components/molecules/CustomAlert';
import { generateQrToken } from '../../services/qrService';
import { useUser } from '../../services/userService';
const { width } = Dimensions.get('window');
interface HelpStep {
  image: any;
  text: string;
}

interface HelpTopic {
  router:string;
  title: string;
  description: string;
  color: string;
}
export default function HomeScreen() {
  const { user, loadUserProfile } = useUser();
  const [refreshing, setRefreshing] = React.useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadUserProfile();
    } finally {
      setRefreshing(false);
    }
  };

  const stats = [
    { label: "Saved CO₂", value: "5.2 kg" },
    { label: "Points", value: "240" },
    { label: "Oil Recycled", value: "12 L" },
  ];
const topics: HelpTopic[] = [
  {
    router: '/GetStartedScreen',
    title: "How to Begin",
    description: "Learn how to start scanning and recycling oil easily.",
    color: "#4CAF50",
  },
  {
    router: '/GetStartedScreen',
    title: "Withdrawal",
    description: "Withdraw your earned points for rewards or benefits.",
    color: "#FF9800",
  }
];
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const router = useRouter();
  const [alertFailedToGenerateVisible, setAlertFailedToGenerateVisible] = useState(false);
  const handleGenerateToken = async () => {
  const token = await generateQrToken();
  console.log('Generated Token:', token);
  if (token) {
    router.push({
      pathname: '/QRCodeScreen',
      params: { token }
    });
  } else {
    setAlertFailedToGenerateVisible(true);
  }
};
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name} 👋</Text>
          <Text style={styles.subtitle}>Thanks for keeping the planet clean 🌍</Text>
        </View>
        <Image 
          source={{ uri: 'https://i.pravatar.cc/100' }} 
          style={styles.profileImage} 
        />
      </View>

      {/* ✅ Eco Stats */}
      <View style={styles.statsContainer}>
        {stats.map((item, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* ✅ Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}
            onPress={handleGenerateToken}>
          <Ionicons name="qr-code" size={28} color="#fff" />
          <Text style={styles.actionText}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="gift" size={28} color="#fff" />
          <Text style={styles.actionText}>Rewards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="time" size={28} color="#fff" />
          <Text style={styles.actionText}>History</Text>
        </TouchableOpacity>
           <CustomAlert
                      visible={alertFailedToGenerateVisible}
                      title="Failed!"
                      message="Failed to generate QR code. Please try again."
                      onClose={() =>{setAlertFailedToGenerateVisible(false);} }
                    />
      </View>

      {/* ✅ Nearby Collection Points */}
      <View style={styles.mapCard}>
        <Text style={styles.mapTitle}>Nearby Collection Points</Text>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1593625289153-f28c2fcb54e6' }}
          style={styles.mapImage}
        />
        <TouchableOpacity style={styles.mapButton}>
          <Text style={styles.mapButtonText}>View on Map</Text>
        </TouchableOpacity>
      </View>
      <View >
      
    </View>
    <HelpCarousel topics={topics} onSelectTopic={setSelectedTopic} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    backgroundColor: '#f2f8f3', // soft eco-friendly green background
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388E3C',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionText: {
    color: '#fff',
    marginTop: 6,
    fontWeight: '600',
  },
  mapCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    elevation: 3,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  mapImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  mapButton: {
    backgroundColor: '#388E3C',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
  },
  categoryCard: {
    width: 100,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryText: {
    color: '#fff',
    marginTop: 8,
    fontWeight: 'bold',
  },
  //modal styles
    modalCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
    modalText: {
    fontSize: 18,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  stepContainer: {
    width: width - 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stepImage: {
    width: 200,
    height: 200,
  },
  stepText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: '#444',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});