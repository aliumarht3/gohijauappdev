import Constants from "expo-constants";
import api from '../api/apiClient';
import authStorage from '../api/authStorage';

export async function getTransaction(): Promise<string | null> {
const { apiBaseUrl} = Constants.expoConfig?.extra ?? {};
     try {
    const token = await authStorage.getAccessToken();

    const response = await api.get(`${apiBaseUrl}/user/all-transactions`);
    const result = response;
    if (result.status) {
      return result.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Token fetch failed:', error);
    return null;
  }
}
export async function getTotalTransaction(): Promise<string | null> {
  try {
    const result = await api.get('/user/total-transaction');
    if (result.status) {
      return result.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Token fetch failed1:', error);
    return null;
  }
}