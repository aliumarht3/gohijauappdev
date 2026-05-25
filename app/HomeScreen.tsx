import HelpCarousel, { HelpTopic } from '@/components/atoms/HelpCarousel';
import { useBottomTabOverflow } from '@/components/CustomTabBar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { interpolate } from '../constants/languages';
import { getTotalTransaction } from '../services/transactionService';
import { useLanguage } from '../services/languageService';
import { useUser } from '../services/userService';
export default function HomeScreen() {
    const { t } = useLanguage();
    const { user, loadUserProfile } = useUser();
    const [refreshing, setRefreshing] = React.useState(false);
    const [totalOilPoured, setTotalOilPoured] = React.useState(0);
    const [totalCO2Saved, setTotalCO2Saved] = React.useState(0);
    const [pointsAwarded, setPointsAwarded] = React.useState(0);
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
    const router = useRouter();
    const tabBarPadding = useBottomTabOverflow();
    const handleRewardPress = () => {
        router.push({
            pathname: '/WithdrawalScreen',
            params: { pointsAwarded }
        });
    }
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: tabBarPadding }}
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
            <View style={styles.quickActionRow}>
                <TouchableOpacity
                    style={styles.historyCard}
                    onPress={() => router.push('/OilHistoryScreen')}
                    accessibilityRole="button"
                >
                    <Ionicons name="time-outline" size={36} color={GREEN_WALLET} />
                    <Text style={styles.historyCardText}>{t.home.transactionHistory}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.nearbyCard}
                    onPress={() => router.push('/MapScreen')}
                    accessibilityRole="button"
                >
                    <Image
                        source={require('../assets/images/mapbackground.jpg')}
                        style={styles.nearbyMapPreview}
                    />
                    <Text style={styles.nearbyCardText}>{t.home.nearby}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.carouselSection}>
                <HelpCarousel topics={topics} />
            </View>
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
        paddingTop: 20,
    },
    carouselSection: {
        marginHorizontal: -20,
        marginTop: 4,
    },
    quickActionRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    historyCard: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        minHeight: 110,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        gap: 12,
    },
    historyCardText: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    nearbyCard: {
        flex: 1,
        backgroundColor: GREEN_HEADER,
        borderRadius: 12,
        overflow: 'hidden',
        minHeight: 110,
        elevation: 3,
    },
    nearbyMapPreview: {
        width: '100%',
        height: 70,
        resizeMode: 'cover',
    },
    nearbyCardText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
});
