import Constants from "expo-constants";
import api from '../api/apiClient';

export async function generateQrTokenTechnician(): Promise<string | null> {
  const { apiBaseUrl } = Constants.expoConfig?.extra ?? {};
  try {
    const result = await api.post('/qr/generate/technician');

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
export async function generateQrTokenCollector(): Promise<string | null> {
  const { apiBaseUrl } = Constants.expoConfig?.extra ?? {};
  try {
    const result = await api.post('/qr/generate/collector');

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
export async function generateQrTokenCustomer(): Promise<string | null> {
  const { apiBaseUrl } = Constants.expoConfig?.extra ?? {};
  try {
    const result = await api.post('/qr/generate/customer');

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