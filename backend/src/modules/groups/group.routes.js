import express from "express";

import { PERMISSIONS } from "../../constants/permissions.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/require-permission.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";

import {
  assignGroupRoles,
  assignGroupUsers,
  createGroup,
  deleteGroup,
  getGroupById,
  getGroups,
  updateGroup,
} from "./group.controller.js";
import {
  assignGroupRolesSchema,
  assignGroupUsersSchema,
  createGroupSchema,
  groupIdSchema,
  listGroupsSchema,
  updateGroupSchema,
} from "./group.schema.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  requirePermission(PERMISSIONS.GROUP.CREATE),
  validate(createGroupSchema),
  createGroup
);

router.get(
  "/",
  authMiddleware,
  requirePermission(PERMISSIONS.GROUP.READ),
  validate(listGroupsSchema),
  getGroups
);

router.get(
  "/:id",
  authMiddleware,
  requirePermission(PERMISSIONS.GROUP.READ),
  validate(groupIdSchema),
  getGroupById
);

router.patch(
  "/:id",
  authMiddleware,
  requirePermission(PERMISSIONS.GROUP.UPDATE),
  validate(updateGroupSchema),
  updateGroup
);

router.patch(
  "/:id/users",
  authMiddleware,
  requirePermission(PERMISSIONS.GROUP.MANAGE_USERS),
  validate(assignGroupUsersSchema),
  assignGroupUsers
);

router.patch(
  "/:id/roles",
  authMiddleware,
  requirePermission(PERMISSIONS.GROUP.MANAGE_ROLES),
  validate(assignGroupRolesSchema),
  assignGroupRoles
);

router.delete(
  "/:id",
  authMiddleware,
  requirePermission(PERMISSIONS.GROUP.DELETE),
  validate(groupIdSchema),
  deleteGroup
);

export default router;