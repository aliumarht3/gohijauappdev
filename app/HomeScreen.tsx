import HelpCarousel from '@/components/atoms/HelpCarousel';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

    const formatAmount = (value: number) =>
        Number.isInteger(value) ? String(value) : value.toFixed(1);

    const walletBalance = `RM${Number(pointsAwarded).toFixed(2)}`;

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
            <View style={styles.heroSection}>
                <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
                    <View style={styles.header}>
                        <View style={styles.headerText}>
                            <Text style={styles.greeting}>
                                {interpolate(t.home.greeting, { name: user?.name || '' })}
                            </Text>
                            <Text style={styles.subtitle}>{t.home.subtitle}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.profileButton}
                            onPress={() => router.push('/(tabs)/profile')}
                            accessibilityRole="button"
                            accessibilityLabel={t.tabs.profile}
                        >
                            <Ionicons name="person" size={22} color="#333" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>

                <View style={styles.walletSection}>
                    <Text style={styles.walletTitle}>{t.home.walletTitle}</Text>
                    <Text style={styles.walletBalance}>{walletBalance}</Text>
                    <TouchableOpacity
                        style={styles.withdrawButton}
                        onPress={handleRewardPress}
                    >
                        <Text style={styles.withdrawButtonText}>{t.home.withdraw}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.impactSection}>
                    <Text style={styles.impactText}>
                        {interpolate(t.home.ucoRecycled, { amount: formatAmount(totalOilPoured) })}
                    </Text>
                    <Text style={styles.impactText}>
                        {interpolate(t.home.co2Saved, { amount: formatAmount(totalCO2Saved) })}
                    </Text>
                </View>
            </View>

            <View style={styles.bodyContent}>
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
            </View>
        </ScrollView>
    );
}

const GREEN_HEADER = '#4CAF50';
const GREEN_WALLET = '#2E7D32';
const GREEN_IMPACT = '#388E3C';

const styles = StyleSheet.create({
    container: {
        flex: 0,
        backgroundColor: '#f2f8f3',
    },
    heroSection: {
        backgroundColor: GREEN_HEADER,
    },
    headerSafeArea: {
        backgroundColor: GREEN_HEADER,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 20,
    },
    headerText: {
        flex: 1,
        paddingRight: 12,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 6,
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    walletSection: {
        backgroundColor: GREEN_WALLET,
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
    },
    walletTitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 8,
    },
    walletBalance: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    withdrawButton: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 24,
        minWidth: 160,
        alignItems: 'center',
    },
    withdrawButtonText: {
        color: GREEN_WALLET,
        fontSize: 16,
        fontWeight: '600',
    },
    impactSection: {
        backgroundColor: GREEN_IMPACT,
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
        gap: 6,
    },
    impactText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
    },
    bodyContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
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
