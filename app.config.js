export default ({ config }) => {
  const isDev = process.env.NODE_ENV === "development";

  return {
    ...config,
    extra: {
      apiBaseUrl: isDev 
        ? "http://10.0.2.2:7192/api" 
        : "https://services.gohijau.org/api",
      signalRUrl: isDev 
        ? "http://10.0.2.2:7192" 
        : "https://services.gohijau.org/",
      eas: {
        projectId: "07f255f3-aa75-4a53-99ef-19078c357204"
      }
    },
  };
};
