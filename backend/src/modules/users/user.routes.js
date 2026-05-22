import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/require-permission.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { PERMISSIONS } from "../../constants/permissions.js";
import {
  assignUserRoles,
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  sendUserPasswordReset,
  updateUser,
  updateUserStatus,
} from "./user.controller.js";
import {
  assignUserRolesSchema,
  createUserSchema,
  listUsersSchema,
  sendUserPasswordResetSchema,
  updateUserSchema,
  updateUserStatusSchema,
  userIdSchema,
} from "./user.schema.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  requirePermission(PERMISSIONS.USER.CREATE),
  validate(createUserSchema),
  createUser
);

router.get(
  "/",
  authMiddleware,
  requirePermission(PERMISSIONS.USER.READ),
  validate(listUsersSchema),
  getUsers
);

router.get(
  "/:id",
  authMiddleware,
  requirePermission(PERMISSIONS.USER.READ),
  validate(userIdSchema),
  getUserById
);

router.patch(
  "/:id",
  authMiddleware,
  requirePermission(PERMISSIONS.USER.UPDATE),
  validate(updateUserSchema),
  updateUser
);

router.patch(
  "/:id/status",
  authMiddleware,
  requirePermission(PERMISSIONS.USER.CHANGE_STATUS),
  validate(updateUserStatusSchema),
  updateUserStatus
);

router.patch(
  "/:id/roles",
  authMiddleware,
  requirePermission(PERMISSIONS.USER.ASSIGN_ROLE),
  validate(assignUserRolesSchema),
  assignUserRoles
);

router.post(
  "/:id/send-password-reset",
  authMiddleware,
  requirePermission(PERMISSIONS.USER.UPDATE),
  validate(sendUserPasswordResetSchema),
  sendUserPasswordReset
);

router.delete(
  "/:id",
  authMiddleware,
  requirePermission(PERMISSIONS.USER.DELETE),
  validate(userIdSchema),
  deleteUser
);

export default router;