import { Language, languageNames } from '@/constants/languages';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../services/languageService';
import theme from '../themes/theme';

const languages: { code: Language; nativeName: string }[] = [
  { code: 'en', nativeName: 'English' },
  { code: 'ms', nativeName: 'Bahasa Melayu' },
  { code: 'zh', nativeName: '中文' },
  { code: 'ta', nativeName: 'தமிழ்' },
];

export default function ChangeLanguageScreen() {
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  const handleSelect = async (code: Language) => {
    await setLanguage(code);
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t.changeLanguageScreen.title,
          headerBackTitle: t.changeLanguageScreen.backTitle,
          headerBackButtonDisplayMode: 'minimal',
          headerShown: true,
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: '#2E7D32',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}
      />
      <View style={styles.container}>
        {languages.map((lang) => {
          const isActive = language === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[styles.card, isActive && styles.cardActive]}
              onPress={() => handleSelect(lang.code)}
            >
              <View style={styles.row}>
                <View>
                  <Text style={[styles.nativeName, isActive && styles.textActive]}>
                    {lang.nativeName}
                  </Text>
                  <Text style={styles.translatedName}>
                    {languageNames[lang.code]}
                  </Text>
                </View>
                {isActive && (
                  <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
  },
  cardActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#F4F9F4',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nativeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  textActive: {
    color: '#2E7D32',
  },
  translatedName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
