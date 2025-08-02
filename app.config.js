export default ({ config }) => {
  const isDev = process.env.NODE_ENV === "development";

  return {
    name: "GoHijauApp",
    slug: "GoHijauApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.jpeg",
    scheme: "gohijauapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.yourcompany.gohijau",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true
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
        : "http://services.gohijau.org/api",
      signalRUrl: isDev 
        ? "http://10.0.2.2:7192" 
        : "http://services.gohijau.org/"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
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
