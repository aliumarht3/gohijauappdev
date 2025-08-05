import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

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
  steps: HelpStep[];
}
//@ts-ignore
export default function HelpCarousel({ topics }: { topics: HelpTopic[] }) {
const router = useRouter();
  return (
    <Carousel
      width={width * 0.85}
      height={360}
      data={topics}
      mode="parallax"
      scrollAnimationDuration={800}
      
      renderItem={({ item }) => (
        <TouchableOpacity
        //@ts-ignore
          style={[styles.card, { backgroundColor: item.color }]}
           onPress={() => {
            console.log('Navigating to:', item.router);
            //@ts-ignore
            router.push(item.router); // ✅ Navigate directly to the screen
          }}
        > 
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.description}</Text>
          
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  carousel: {
    alignSelf: 'center',
    marginVertical: 10,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    height: 250,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardDesc: {
    fontSize: 18,
    color: '#fff',
    marginTop: 8,
    opacity: 0.9,
  },
});
