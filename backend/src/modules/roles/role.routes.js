import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/require-permission.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { PERMISSIONS } from "../../constants/permissions.js";
import {
  appendRolePermissions,
  assignRolePermissions,
  createRole,
  deleteRole,
  getRoleById,
  getRoles,
  removeRolePermissions,
  updateRole,
} from "./role.controller.js";
import {
  appendRolePermissionsSchema,
  assignRolePermissionsSchema,
  createRoleSchema,
  listRolesSchema,
  removeRolePermissionsSchema,
  roleIdSchema,
  updateRoleSchema,
} from "./role.schema.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  requirePermission(PERMISSIONS.ROLE.CREATE),
  validate(createRoleSchema),
  createRole
);

router.get(
  "/",
  authMiddleware,
  requirePermission(PERMISSIONS.ROLE.READ),
  validate(listRolesSchema),
  getRoles
);

router.get(
  "/:id",
  authMiddleware,
  requirePermission(PERMISSIONS.ROLE.READ),
  validate(roleIdSchema),
  getRoleById
);

router.patch(
  "/:id",
  authMiddleware,
  requirePermission(PERMISSIONS.ROLE.UPDATE),
  validate(updateRoleSchema),
  updateRole
);

router.patch(
  "/:id/permissions",
  authMiddleware,
  requirePermission(PERMISSIONS.ROLE.ASSIGN_PERMISSION),
  validate(assignRolePermissionsSchema),
  assignRolePermissions
);

router.patch(
  "/:id/permissions/append",
  authMiddleware,
  requirePermission(PERMISSIONS.ROLE.ASSIGN_PERMISSION),
  validate(appendRolePermissionsSchema),
  appendRolePermissions
);

router.patch(
  "/:id/permissions/remove",
  authMiddleware,
  requirePermission(PERMISSIONS.ROLE.ASSIGN_PERMISSION),
  validate(removeRolePermissionsSchema),
  removeRolePermissions
);

router.delete(
  "/:id",
  authMiddleware,
  requirePermission(PERMISSIONS.ROLE.DELETE),
  validate(roleIdSchema),
  deleteRole
);

export default router;