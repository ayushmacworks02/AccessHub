import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/require-permission.middleware.js";
import { PERMISSIONS } from "../../constants/permissions.js";
import { listPermissions } from "./permission.controller.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  requirePermission(PERMISSIONS.PERMISSION.READ),
  listPermissions
);

export default router;