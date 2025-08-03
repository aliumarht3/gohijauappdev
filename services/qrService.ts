import Constants from "expo-constants";
import api from '../api/apiClient';

export async function generateQrToken(): Promise<string | null> {
const { apiBaseUrl} = Constants.expoConfig?.extra ?? {};
  try {
    const result = await api.post('/user/profile');

    if (result.data.success) {
      return result.data.token;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Token fetch failed:', error);
    return null;
  }
}
