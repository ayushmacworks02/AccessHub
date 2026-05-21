import { ApiResponse } from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  appendRolePermissionsService,
  assignRolePermissionsService,
  createRoleService,
  deleteRoleService,
  getRoleByIdService,
  getRolesService,
  removeRolePermissionsService,
  updateRoleService,
} from "./role.service.js";

export const createRole = asyncHandler(async (req, res) => {
  const role = await createRoleService({
    payload: req.validated.body,
    actorId: req.user?._id,
    req,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { role }, "Role created"));
});

export const getRoles = asyncHandler(async (req, res) => {
  const result = await getRolesService(req.validated.query);

  return res.status(200).json(new ApiResponse(200, result, "Roles fetched"));
});

export const getRoleById = asyncHandler(async (req, res) => {
  const role = await getRoleByIdService({
    roleId: req.validated.params.id,
  });

  return res.status(200).json(new ApiResponse(200, { role }, "Role fetched"));
});

export const updateRole = asyncHandler(async (req, res) => {
  const role = await updateRoleService({
    roleId: req.validated.params.id,
    payload: req.validated.body,
    actorId: req.user?._id,
    req,
  });

  return res.status(200).json(new ApiResponse(200, { role }, "Role updated"));
});

export const assignRolePermissions = asyncHandler(async (req, res) => {
  const role = await assignRolePermissionsService({
    roleId: req.validated.params.id,
    permissionIds: req.validated.body.permissions,
    actorId: req.user?._id,
    req,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { role }, "Role permissions replaced"));
});

export const appendRolePermissions = asyncHandler(async (req, res) => {
  const role = await appendRolePermissionsService({
    roleId: req.validated.params.id,
    permissionIds: req.validated.body.permissions,
    actorId: req.user?._id,
    req,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { role }, "Role permissions appended"));
});

export const removeRolePermissions = asyncHandler(async (req, res) => {
  const role = await removeRolePermissionsService({
    roleId: req.validated.params.id,
    permissionIds: req.validated.body.permissions,
    actorId: req.user?._id,
    req,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { role }, "Role permissions removed"));
});

export const deleteRole = asyncHandler(async (req, res) => {
  const result = await deleteRoleService({
    roleId: req.validated.params.id,
    req,
  });

  return res.status(200).json(new ApiResponse(200, result, "Role deleted"));
});