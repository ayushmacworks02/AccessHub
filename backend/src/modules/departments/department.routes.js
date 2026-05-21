import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/require-permission.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { PERMISSIONS } from "../../constants/permissions.js";
import {
  createDepartment,
  deleteDepartment,
  getDepartmentById,
  getDepartments,
  updateDepartment,
} from "./department.controller.js";
import {
  createDepartmentSchema,
  departmentIdSchema,
  listDepartmentsSchema,
  updateDepartmentSchema,
} from "./department.schema.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  requirePermission(PERMISSIONS.DEPARTMENT.CREATE),
  validate(createDepartmentSchema),
  createDepartment
);

router.get(
  "/",
  authMiddleware,
  requirePermission(PERMISSIONS.DEPARTMENT.READ),
  validate(listDepartmentsSchema),
  getDepartments
);

router.get(
  "/:id",
  authMiddleware,
  requirePermission(PERMISSIONS.DEPARTMENT.READ),
  validate(departmentIdSchema),
  getDepartmentById
);

router.patch(
  "/:id",
  authMiddleware,
  requirePermission(PERMISSIONS.DEPARTMENT.UPDATE),
  validate(updateDepartmentSchema),
  updateDepartment
);

router.delete(
  "/:id",
  authMiddleware,
  requirePermission(PERMISSIONS.DEPARTMENT.DELETE),
  validate(departmentIdSchema),
  deleteDepartment
);

export default router;