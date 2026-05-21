const getRequiredEnv = (key, fallback = "") => {
  const value = import.meta.env[key];

  if (!value && fallback) {
    return fallback;
  }

  return value || "";
};

export const envConfig = {
  appName: import.meta.env.VITE_APP_NAME || "AccessHub",

  apiBaseUrl: getRequiredEnv(
    "VITE_API_BASE_URL",
    "http://localhost:5000/api"
  ),

  nodeEnv: import.meta.env.MODE,

  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};