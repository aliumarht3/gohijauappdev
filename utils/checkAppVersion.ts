import * as Application from "expo-application";
import { Platform } from "react-native";
import api from '../api/apiClient';

export const checkAppVersion = async (): Promise<boolean> => {
  try {
    const currentBuildNumber = parseInt(Application.nativeBuildVersion ?? "0");

    const res = await api.get('/get-latest-app-version');
    const data = res.data;

    const latestBuild =
      Platform.OS === "android"
        ? data.latestBuildNumber.android
        : data.latestBuildNumber.ios;

    if (currentBuildNumber < latestBuild) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Version check failed:", error);
    return true; // let the user continue even if API fails
  }
};
