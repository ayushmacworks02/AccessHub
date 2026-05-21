import dotenv from "dotenv";

dotenv.config();

const requiredEnvVariables = [
  "MONGO_URI",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
];

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

const isProduction = process.env.NODE_ENV === "production";

const mailDriver = process.env.MAIL_DRIVER || "ethereal";

if (isProduction && mailDriver === "smtp") {
  const requiredMailVariables = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"];

  for (const variable of requiredMailVariables) {
    if (!process.env[variable]) {
      throw new Error(`Missing required mail environment variable: ${variable}`);
    }
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction,
  isDevelopment: !isProduction,

  port: Number(process.env.PORT) || 5000,

  mongoUri: process.env.MONGO_URI,

  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,

  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",

  cookieSecure: process.env.COOKIE_SECURE === "true" || isProduction,
  cookieSameSite: process.env.COOKIE_SAME_SITE || "lax",

  superAdminName: process.env.SUPER_ADMIN_NAME || "Super Admin",
  superAdminEmail: process.env.SUPER_ADMIN_EMAIL || "admin@example.com",
  superAdminPassword: process.env.SUPER_ADMIN_PASSWORD || "Admin@12345",

  mailDriver,
  mailFromName: process.env.MAIL_FROM_NAME || "AccessHub",
  mailFromEmail: process.env.MAIL_FROM_EMAIL || "no-reply@accesshub.local",

  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",

  frontendResetPasswordUrl:
    process.env.FRONTEND_RESET_PASSWORD_URL ||
    "http://localhost:5173/reset-password",

  passwordResetTokenExpiresMinutes:
    Number(process.env.PASSWORD_RESET_TOKEN_EXPIRES_MINUTES) || 15,
};