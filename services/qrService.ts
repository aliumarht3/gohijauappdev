import Constants from "expo-constants";
import authStorage from '../api/authStorage';

export async function generateQrToken(): Promise<string | null> {
const { apiBaseUrl} = Constants.expoConfig?.extra ?? {};
  try {
    const token = await authStorage.getAccessToken();

    const response = await fetch(`${apiBaseUrl}/qr/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (result.success) {
      return result.token;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Token fetch failed:', error);
    return null;
  }
}
