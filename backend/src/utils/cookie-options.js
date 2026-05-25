import { env } from "../config/env.js";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const baseCookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: env.cookieSameSite,
  path: "/",
};

export const accessTokenCookieOptions = {
  ...baseCookieOptions,
  maxAge: FIFTEEN_MINUTES,
};

export const refreshTokenCookieOptions = {
  ...baseCookieOptions,
  maxAge: SEVEN_DAYS,
};

export const clearAuthCookieOptions = {
  ...baseCookieOptions,
  expires: new Date(0),
  maxAge: 0,
};

export const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie("accessToken", accessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
};

export const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", clearAuthCookieOptions);
  res.clearCookie("refreshToken", clearAuthCookieOptions);

  res.cookie("accessToken", "", clearAuthCookieOptions);
  res.cookie("refreshToken", "", clearAuthCookieOptions);
};