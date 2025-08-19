export default ({ config }) => {
  const isDev = process.env.NODE_ENV === "development";

  return {
    name: "GoHijau",
    slug: "GoHijauApp",
    version: "3.0.4",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "gohijauapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: false,
      buildNumber: "6",
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
      versionCode: 18,
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
      apiBaseUrl: isDev 
        ? "http://10.0.2.2:7192/api" 
        : "https://services.gohijau.org/api",
      signalRUrl: isDev 
        ? "http://10.0.2.2:7192" 
        : "https://services.gohijau.org"
    },
    plugins: [
      "expo-router",
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
