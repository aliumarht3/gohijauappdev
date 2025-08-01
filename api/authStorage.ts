import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

const authStorage = {
  async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem(ACCESS_KEY);
  },
  async setAccessToken(token: string): Promise<void> {
    await AsyncStorage.setItem(ACCESS_KEY, token);
  },
  async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem(REFRESH_KEY);
  },
  async setRefreshToken(token: string): Promise<void> {
    await AsyncStorage.setItem(REFRESH_KEY, token);
  },
  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
  },
};

export default authStorage;
