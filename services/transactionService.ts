import api from '../api/apiClient';

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
