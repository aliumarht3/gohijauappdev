import HelpCarousel from '@/components/atoms/HelpCarousel';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { interpolate } from '../constants/languages';
import CustomAlert from '../components/molecules/CustomAlert';
import { generateQrTokenCustomer } from '../services/qrService';
import { getTotalTransaction } from '../services/transactionService';
import { useLanguage } from '../services/languageService';
import { useUser } from '../services/userService';
const { width } = Dimensions.get('window');
interface HelpStep {
    image: any;
    text: string;
}

interface HelpTopic {
    router: string;
    title: string;
    description: string;
    color: string;
}
export default function HomeScreen() {
    const { t } = useLanguage();
    const { user, loadUserProfile } = useUser();
    const [refreshing, setRefreshing] = React.useState(false);
    const [totalOilPoured, setTotalOilPoured] = React.useState(0);
    const [totalCO2Saved, setTotalCO2Saved] = React.useState(0);
    const [pointsAwarded, setPointsAwarded] = React.useState(0);
    const [rewardsAlertVisible, setRewardsAlertVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setRefreshing(true);
                const result = await getTotalTransaction();
                if (result) {
                    setTotalOilPoured(result.totalOilPoured);
                    setTotalCO2Saved(result.totalCO2Saved);
                    setPointsAwarded(result.pointsAwarded);
                }
                await loadUserProfile();
            } finally {
                setRefreshing(false);
            }
        };

        fetchData();
    }, []);

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            const result = await getTotalTransaction();
            if (result) {
                setTotalOilPoured(result.totalOilPoured);
                setTotalCO2Saved(result.totalCO2Saved);
                setPointsAwarded(result.pointsAwarded);
            }
            await loadUserProfile();
        } finally {
            setRefreshing(false);
        }
    };

    const stats = [
        { label: t.home.oilRecycled, value: totalOilPoured, unit: "KG" },
        { label: t.home.rewards, value: pointsAwarded, unit: "RM" },
        { label: t.home.savedCO2, value: totalCO2Saved, unit: "kg" },
    ];
    const topics: HelpTopic[] = [
        {
            router: '/GetStartedScreen',
            title: t.home.howToBegin,
            description: t.home.howToBeginDesc,
            color: "#4CAF50",
        },
        {
            router: '/GetStartedScreen',
            title: t.home.withdrawal,
            description: t.home.withdrawalDesc,
            color: "#FF9800",
        }
    ];
    const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
    const router = useRouter();
    const [alertFailedToGenerateVisible, setAlertFailedToGenerateVisible] = useState(false);
    const handleGenerateToken = async () => {
        const token = await generateQrTokenCustomer();
        console.log('Generated Token:', token);
        if (token) {
            router.push({
                pathname: '/QRCodeScreen',
                params: {
                    token
                }
            });
        } else {
            setAlertFailedToGenerateVisible(true);
        }
    };
    const handleRewardPress = () => {
        router.push({
            pathname: '/WithdrawalScreen',
            params: { pointsAwarded }
        });
    }
    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>{interpolate(t.home.greeting, { name: user?.name || '' })}</Text>
                    <Text style={styles.subtitle}>{t.home.subtitle}</Text>
                </View>
                <Image
                    source={require('../assets/images/icon.png')}
                    style={styles.profileImage}
                />
            </View>

            {/* ✅ Eco Stats */}
            <View style={styles.statsContainer}>
                {stats.map((item, index) => (
                    <View key={index} style={styles.statCard}>
                        <Text
                            style={styles.statValue}
                        // numberOfLines={1}
                        >
                            {item.label === t.home.rewards
                                ? `${item.unit} ${item.value}`
                                : `${item.value} ${item.unit}`}
                        </Text>
                        <Text style={styles.statLabel}>{item.label}</Text>
                    </View>
                ))}
            </View>

            {/* ✅ Quick Actions */}
            <View style={styles.quickActions}>
                <TouchableOpacity style={styles.actionButton}
                    onPress={handleGenerateToken}>
                    <Ionicons name="qr-code" size={28} color="#fff" />
                    <Text style={styles.actionText}>{t.home.scan}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}
                    onPress={() => handleRewardPress()}>
                    <Ionicons name="gift" size={28} color="#fff" />
                    <Text style={styles.actionText}>{t.home.rewards}</Text>
                </TouchableOpacity>
                <CustomAlert
                    visible={rewardsAlertVisible}
                    title={t.common.comingSoon}
                    message={t.home.rewardsComingSoon}
                    onClose={() => { setRewardsAlertVisible(false); }}
                />
                <TouchableOpacity style={styles.actionButton}
                    onPress={() => router.push('/OilHistoryScreen')}>
                    <Ionicons name="time" size={28} color="#fff" />
                    <Text style={styles.actionText}>{t.home.history}</Text>
                </TouchableOpacity>
                <CustomAlert
                    visible={alertFailedToGenerateVisible}
                    title={t.common.failedTitle}
                    message={t.common.failedQrGeneration}
                    onClose={() => { setAlertFailedToGenerateVisible(false); }}
                />
            </View>

            {/* ✅ Nearby Collection Points */}
            <View style={styles.mapCard}>
                <Text style={styles.mapTitle}>{t.home.nearbyPoints}</Text>
                <Image
                    source={require('../assets/images/mapbackground.jpg')}
                    style={styles.mapImage}
                />
                <TouchableOpacity style={styles.mapButton} onPress={() => router.push('/MapScreen')}>
                    <Text style={styles.mapButtonText}>{t.home.viewOnMap}</Text>
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
        textAlign: 'center',
        flexShrink: 1,
    },
    statLabel: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
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
        fontSize: 14,
        textAlign: 'center',
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
