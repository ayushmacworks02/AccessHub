import { env } from "../../config/env.js";
import { ApiResponse } from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { clearAuthCookies, setAuthCookies } from "../../utils/cookie-options.js";
import {
  forgotPasswordService,
  getAuthenticatedUser,
  loginUser,
  logoutUser,
  logoutUserFromAllDevices,
  refreshUserSession,
  resetPasswordService,
} from "./auth.service.js";

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

  return res
    .status(200)
    .json(
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

  await resetPasswordService({
    rawToken: token,
    password,
    req,
  });

  clearAuthCookies(res);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password reset successful"));
});