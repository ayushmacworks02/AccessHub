import { env } from "../../config/env.js";
import { ApiResponse } from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { clearAuthCookies, setAuthCookies } from "../../utils/cookie-options.js";
import { findRefreshToken, verifyAccessToken } from "./token.service.js";
import {
  forgotPasswordService,
  getAuthenticatedUser,
  loginUser,
  logoutUser,
  logoutUserFromAllDevices,
  refreshUserSession,
  resetPasswordService,
} from "./auth.service.js";

const getCurrentSessionUserIdFromRequest = async (req) => {
  const accessToken = req.cookies?.accessToken;

  if (accessToken) {
    try {
      const decoded = verifyAccessToken(accessToken);
      return decoded?.userId || null;
    } catch {
      // Access token may be expired. Try refresh cookie below.
    }
  }

  const rawRefreshToken = req.cookies?.refreshToken;

  if (!rawRefreshToken) {
    return null;
  }

  try {
    const refreshTokenRecord = await findRefreshToken(rawRefreshToken);
    return refreshTokenRecord?.user?.toString() || null;
  } catch {
    return null;
  }
};

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;

  const { accessToken, refreshToken, user } = await loginUser({
    email,
    password,
    req,
  });

  setAuthCookies(res, {
    accessToken,
    refreshToken,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Login successful"));
});

export const refresh = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;

  const { accessToken, refreshToken, user } = await refreshUserSession({
    rawRefreshToken,
    req,
  });

  setAuthCookies(res, {
    accessToken,
    refreshToken,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Session refreshed"));
});

export const logout = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;

  await logoutUser({
    rawRefreshToken,
    req,
  });

  clearAuthCookies(res);

  return res.status(200).json(new ApiResponse(200, null, "Logout successful"));
});

export const logoutAll = asyncHandler(async (req, res) => {
  await logoutUserFromAllDevices({
    userId: req.user._id,
    req,
  });

  clearAuthCookies(res);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out from all devices"));
});

export const me = asyncHandler(async (req, res) => {
  const user = await getAuthenticatedUser(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Authenticated user fetched"));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.validated.body;

  const result = await forgotPasswordService({
    email,
    req,
  });

  const responseData = env.isDevelopment
    ? {
        previewUrl: result.previewUrl,
      }
    : null;

  return res.status(200).json(
    new ApiResponse(
      200,
      responseData,
      "If an active account exists with this email, a password reset link has been sent"
    )
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.validated.body;
  const { token } = req.validated.params;

  const currentSessionUserId = await getCurrentSessionUserIdFromRequest(req);

  const result = await resetPasswordService({
    rawToken: token,
    password,
    req,
  });

  const resetUserId = result?.userId?.toString();

  const shouldClearCurrentBrowserSession =
    Boolean(currentSessionUserId) &&
    Boolean(resetUserId) &&
    currentSessionUserId === resetUserId;

  if (shouldClearCurrentBrowserSession) {
    clearAuthCookies(res);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        sessionCleared: shouldClearCurrentBrowserSession,
      },
      shouldClearCurrentBrowserSession
        ? "Password reset successful. Please login again"
        : "Password reset successful"
    )
  );
});