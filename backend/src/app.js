import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { env } from "./config/env.js";
import { globalRateLimiter } from "./middleware/rate-limit.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

import healthRoutes from "./health/health.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import permissionRoutes from "./modules/permissions/permission.routes.js";
import departmentRoutes from "./modules/departments/department.routes.js";
import roleRoutes from "./modules/roles/role.routes.js";
import groupRoutes from "./modules/groups/group.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import auditRoutes from "./modules/audits/audit.routes.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

app.use(globalRateLimiter);

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.use(cookieParser());

app.use(compression());

if (env.isDevelopment) {
  app.use(morgan("dev"));
}

app.get("/", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "NxAuth backend is running",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/users", userRoutes);
app.use("/api/audits", auditRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;