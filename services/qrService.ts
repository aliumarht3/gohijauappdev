import Constants from "expo-constants";

export async function generateQrToken(userId: string): Promise<string | null> {
const { apiBaseUrl} = Constants.expoConfig?.extra ?? {};
  try {
    const response = await fetch(`${apiBaseUrl}/qr/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
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
