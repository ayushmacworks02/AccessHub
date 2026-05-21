import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/require-permission.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { PERMISSIONS } from "../../constants/permissions.js";
import { getAuditById, getAudits } from "./audit.controller.js";
import { auditIdSchema, listAuditsSchema } from "./audit.schema.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  requirePermission(PERMISSIONS.AUDIT.READ),
  validate(listAuditsSchema),
  getAudits
);

router.get(
  "/:id",
  authMiddleware,
  requirePermission(PERMISSIONS.AUDIT.READ),
  validate(auditIdSchema),
  getAuditById
);

export default router;