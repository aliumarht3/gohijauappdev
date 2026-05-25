import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 260;

export interface HelpTopic {
  router: string;
  title: string;
  description: string;
  color: string;
}

interface HelpCarouselProps {
  topics: HelpTopic[];
}

export default function HelpCarousel({ topics }: HelpCarouselProps) {
  const router = useRouter();
  const carouselRef = useRef<ICarouselInstance>(null);

  if (topics.length === 0) {
    return null;
  }

  const showNav = topics.length > 1;

  return (
    <View style={styles.wrapper}>
      <Carousel
        ref={carouselRef}
        width={SCREEN_WIDTH}
        height={CAROUSEL_HEIGHT}
        data={topics}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 48,
        }}
        loop={showNav}
        scrollAnimationDuration={600}
        style={styles.carousel}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: item.color }]}
            activeOpacity={0.9}
            onPress={() => router.push(item.router as never)}
            accessibilityRole="button"
            accessibilityLabel={item.title}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />

      {showNav && (
        <>
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonLeft]}
            onPress={() => carouselRef.current?.prev()}
            accessibilityRole="button"
            accessibilityLabel="Previous"
          >
            <Ionicons name="chevron-back" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonRight]}
            onPress={() => carouselRef.current?.next()}
            accessibilityRole="button"
            accessibilityLabel="Next"
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
    borderRadius: 16,
    marginHorizontal: 8,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 15,
    color: '#fff',
    marginTop: 10,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
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
