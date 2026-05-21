import express from "express";
import { authRateLimiter } from "../../middleware/rate-limit.middleware.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from "./auth.schema.js";
import {
  forgotPassword,
  login,
  logout,
  logoutAll,
  me,
  refresh,
  resetPassword,
} from "./auth.controller.js";

const router = express.Router();

router.post("/login", authRateLimiter, validate(loginSchema), login);

router.post(
  "/forgot-password",
  authRateLimiter,
  validate(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/reset-password/:token",
  authRateLimiter,
  validate(resetPasswordSchema),
  resetPassword
);

router.post("/refresh", authRateLimiter, refresh);

router.post("/logout", authMiddleware, logout);

router.post("/logout-all", authMiddleware, logoutAll);

router.get("/me", authMiddleware, me);

export default router;