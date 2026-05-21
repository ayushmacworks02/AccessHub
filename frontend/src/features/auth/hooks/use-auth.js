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
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

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
    onSuccess: (user) => {
      setUser(user);
    },
    onError: () => {
      clearUser();
    },
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

      toast.success("Login successful");
      navigate(appConfig.routes.dashboard, {
        replace: true,
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Login failed"));
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

      toast.success("Logout successful");
      navigate(appConfig.routes.login, {
        replace: true,
      });
    },
    onError: (error) => {
      clearUser();
      queryClient.clear();

      toast.error(getApiErrorMessage(error, "Logout failed"));
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
        toast.success("Reset link generated. Check the preview URL in response.");
        return;
      }

      toast.success("If an active account exists, reset instructions have been sent.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to process request"));
    },
  });
};

export const useResetPasswordMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast.success("Password reset successful. Please login.");
      navigate(appConfig.routes.login, {
        replace: true,
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to reset password"));
    },
  });
};