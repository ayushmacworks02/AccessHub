const getEnvValue = (key, fallback = "") => {
  const value = import.meta.env[key];

  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return value;
};

export const envConfig = {
  appName: getEnvValue("VITE_APP_NAME", "AccessHub"),

  apiBaseUrl: getEnvValue(
    "VITE_API_BASE_URL",
    "http://localhost:5000/api"
  ),

  nodeEnv: import.meta.env.MODE,

  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};