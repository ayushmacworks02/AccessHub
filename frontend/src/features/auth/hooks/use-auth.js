import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { authApi } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { queryClient } from "@/lib/query/query-client";
import { getApiErrorMessage } from "@/lib/api/api-response";
import { appConfig } from "@/config/app.config";

export const AUTH_QUERY_KEYS = {
  me: ["auth", "me"],
};

export const useCurrentUserQuery = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.me,
    queryFn: async () => {
      const data = await authApi.me();
      return data?.user || null;
    },
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      const user = data?.user || null;

      setUser(user);
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, user);

      toast.success("Login successful", {
        id: "login-success",
      });

      navigate(appConfig.routes.dashboard, {
        replace: true,
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Login failed"), {
        id: "login-error",
      });
    },
  });
};

export const useLogoutMutation = () => {
  const navigate = useNavigate();
  const clearUser = useAuthStore((state) => state.clearUser);

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearUser();
      queryClient.clear();

      toast.success("Logout successful", {
        id: "logout-success",
      });

      navigate(appConfig.routes.login, {
        replace: true,
      });
    },
    onError: (error) => {
      clearUser();
      queryClient.clear();

      toast.error(getApiErrorMessage(error, "Logout failed"), {
        id: "logout-error",
      });

      navigate(appConfig.routes.login, {
        replace: true,
      });
    },
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (data) => {
      if (data?.previewUrl) {
        toast.success("Reset link generated. Check the preview URL in response.", {
          id: "forgot-password-preview",
        });
        return;
      }

      toast.success("If an active account exists, reset instructions have been sent.", {
        id: "forgot-password-success",
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to process request"), {
        id: "forgot-password-error",
      });
    },
  });
};

export const useResetPasswordMutation = () => {
  const navigate = useNavigate();

  const clearUser = useAuthStore((state) => state.clearUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: (data) => {
      const sessionCleared = Boolean(data?.sessionCleared);

      if (sessionCleared) {
        clearUser();
        queryClient.clear();

        toast.success("Password reset successful. Please login again.", {
          id: "reset-password-success",
        });

        navigate(appConfig.routes.login, {
          replace: true,
        });

        return;
      }

      toast.success("Password reset successful.", {
        id: "reset-password-success",
      });

      if (isAuthenticated) {
        navigate(appConfig.routes.dashboard, {
          replace: true,
        });
        return;
      }

      navigate(appConfig.routes.login, {
        replace: true,
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to reset password"), {
        id: "reset-password-error",
      });
    },
  });
};