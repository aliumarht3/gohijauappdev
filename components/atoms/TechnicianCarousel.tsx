import { DashboardTheme } from '@/constants/dashboardTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { useLanguage } from '@/services/languageService';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 240;

export type TechnicianCarouselSlide = {
  id: string;
  title: string;
  message: string;
};

interface TechnicianCarouselProps {
  slides: TechnicianCarouselSlide[];
}

export default function TechnicianCarousel({ slides }: TechnicianCarouselProps) {
  const { t } = useLanguage();
  const carouselRef = useRef<ICarouselInstance>(null);

  if (slides.length === 0) {
    return null;
  }

  const showNav = slides.length > 1;

  return (
    <View style={styles.wrapper}>
      <Carousel
        ref={carouselRef}
        width={SCREEN_WIDTH}
        height={CAROUSEL_HEIGHT}
        data={slides}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 48,
        }}
        loop={showNav}
        scrollAnimationDuration={600}
        style={styles.carousel}
        renderItem={({ item }) => (
          <View style={styles.card} accessibilityRole="summary">
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.comingSoonRow}>
              <Ionicons name="alert-circle-outline" size={22} color={DashboardTheme.walletGreen} />
              <Text style={styles.cardMessage}>{item.message}</Text>
            </View>
          </View>
        )}
      />

      {showNav && (
        <>
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonLeft]}
            onPress={() => carouselRef.current?.prev()}
            accessibilityRole="button"
            accessibilityLabel={t.common.previous}
          >
            <Ionicons name="chevron-back" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonRight]}
            onPress={() => carouselRef.current?.next()}
            accessibilityRole="button"
            accessibilityLabel={t.common.next}
          >
            <Ionicons name="chevron-forward" size={22} color="#333" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
    alignSelf: 'center',
    marginBottom: 8,
  },
  carousel: {
    width: SCREEN_WIDTH,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: DashboardTheme.borderLight,
    marginHorizontal: 8,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  comingSoonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 4,
  },
  cardMessage: {
    flex: 1,
    fontSize: 14,
    color: '#5B6B73',
    lineHeight: 20,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    zIndex: 10,
  },
  navButtonLeft: {
    left: 12,
  },
  navButtonRight: {
    right: 12,
  },
});
