export default ({ config }) => {
  const isDev = process.env.NODE_ENV === "development";

  return {
    name: "GoHijau",
    slug: "GoHijauApp",
    version: "3.0.15",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "gohijauapp",
    "linking": {
      "schemes": ["gohijauapp"],
      "prefixes": ["gohijauapp://", "https://dashboard.gohijau.org"],
      "config": {
        "screens": {
          "auth": {
            "screens": {
              "reset-password": "reset-password?token=:token"
            }
          },
          "*": "*"
        }
      }
    },
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: false,
      buildNumber: "19",
      config: {
        googleMapsApiKey: "AIzaSyBqVrQQ_5FJye-7-BVgrtWOHrOulpSxycI"
      },
      bundleIdentifier: "com.myro.gohijau",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription: "We need your location to show nearby oil collection points.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "We need your location to show nearby oil collection points.",
        LSApplicationQueriesSchemes: ["waze", "comgooglemaps"],
      },
    },
    android: {
      package: "com.myro.gohijau",
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      versionCode: 29,
      config: {
        googleMaps: {
          apiKey: "AIzaSyBqVrQQ_5FJye-7-BVgrtWOHrOulpSxycI"
        }
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    extra: {
      eas: {
        projectId: "07f255f3-aa75-4a53-99ef-19078c357204"
      },
      // Hardcoded to production for physical device testing
      apiBaseUrl: "https://services.gohijau.org/api",
      signalRUrl: "https://services.gohijau.org"
    },
    plugins: [
      "expo-audio",
      "expo-router",
      "expo-asset",
      "expo-font",
      "expo-image",
      "expo-web-browser",
      "react-native-maps",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    }
  };
};
