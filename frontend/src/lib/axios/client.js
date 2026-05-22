import axios from "axios";
import { toast } from "sonner";

import { envConfig } from "@/config/env.config";
import { appConfig } from "@/config/app.config";

export const apiClient = axios.create({
  baseURL: envConfig.apiBaseUrl,
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let sessionExpiredToastShown = false;
let failedQueue = [];

const AUTH_PUBLIC_ENDPOINTS = [
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
];

const AUTH_REFRESH_ENDPOINT = "/auth/refresh";
const AUTH_ME_ENDPOINT = "/auth/me";

const isPublicAuthEndpoint = (url = "") => {
  return AUTH_PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

const isRefreshEndpoint = (url = "") => {
  return url.includes(AUTH_REFRESH_ENDPOINT);
};

const isAuthMeEndpoint = (url = "") => {
  return url.includes(AUTH_ME_ENDPOINT);
};

const processQueue = (error = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }

    resolve();
  });

  failedQueue = [];
};

const redirectToLogin = async () => {
  const currentPath = window.location.pathname;

  const isAlreadyOnPublicRoute =
    currentPath === appConfig.routes.login ||
    currentPath === appConfig.routes.forgotPassword ||
    currentPath.startsWith(appConfig.routes.resetPassword);

  if (!isAlreadyOnPublicRoute) {
    window.history.replaceState(null, "", appConfig.routes.login);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
};

const handleSessionExpired = async () => {
  try {
    const authStoreModule = await import("@/features/auth/store/auth.store");
    const queryClientModule = await import("@/lib/query/query-client");

    authStoreModule.useAuthStore.getState().clearUser();
    queryClientModule.queryClient.clear();
  } catch {
    // Keep this silent because this handler is a last-resort auth cleanup.
  }

  if (!sessionExpiredToastShown) {
    sessionExpiredToastShown = true;

    toast.error("Your session has expired. Please sign in again.", {
      id: "session-expired",
    });

    window.setTimeout(() => {
      sessionExpiredToastShown = false;
    }, 5000);
  }

  await redirectToLogin();
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const requestUrl = originalRequest?.url || "";

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (status !== 401) {
      return Promise.reject(error);
    }

    if (
      originalRequest._retry ||
      isRefreshEndpoint(requestUrl) ||
      isPublicAuthEndpoint(requestUrl)
    ) {
      if (isRefreshEndpoint(requestUrl) || isAuthMeEndpoint(requestUrl)) {
        await handleSessionExpired();
      }

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: () => resolve(apiClient(originalRequest)),
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      await apiClient.post(AUTH_REFRESH_ENDPOINT);
      processQueue();
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      await handleSessionExpired();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);