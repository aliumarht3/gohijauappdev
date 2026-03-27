// components/UpdateRequiredScreen.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Text, TouchableOpacity, View } from 'react-native';
import api from '../api/apiClient';
import { useLanguage } from '../services/languageService';

async function getLatestAppInfo(): Promise<string | null> {
  try {
    const result = await api.get('/get-latest-app-version');

    if (result.data) {
      return result.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Token fetch failed:', error);
    return null;
  }
}

export function UpdateRequiredScreen() {
  const { t } = useLanguage();
  const [storeUrl, setStoreUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppInfo = async () => {
      const appInfo = await getLatestAppInfo();

      if (appInfo?.updateUrl) {
        const url =
          Platform.OS === 'android'
            ? appInfo.updateUrl.android
            : appInfo.updateUrl.ios;
        setStoreUrl(url);
      }

      setLoading(false);
    };

    fetchAppInfo();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}
      >
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>{t.updateRequired.checking}</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
        {t.updateRequired.title}
      </Text>
      <Text
        style={{
          textAlign: 'center',
          marginBottom: 20,
          fontSize: 16,
          color: '#555',
        }}
      >
        {t.updateRequired.message}
      </Text>
      <TouchableOpacity
        onPress={() =>{
          if (storeUrl) {
            Linking.openURL(storeUrl);
          } else {
            alert(t.updateRequired.storeLinkUnavailable);
          }
        }}
        style={{
          backgroundColor: '#4CAF50',
          paddingVertical: 12,
          paddingHorizontal: 25,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>{t.updateRequired.updateButton}</Text>
      </TouchableOpacity>
    </View>
  );
}
