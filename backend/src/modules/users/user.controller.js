import { ApiResponse } from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  assignUserRolesService,
  createUserService,
  deleteUserService,
  getUserByIdService,
  getUsersService,
  updateUserService,
  updateUserStatusService,
} from "./user.service.js";

export const createUser = asyncHandler(async (req, res) => {
  const user = await createUserService({
    payload: req.validated.body,
    actorId: req.user?._id,
    req,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { user }, "User created"));
});

export const getUsers = asyncHandler(async (req, res) => {
  const result = await getUsersService(req.validated.query);

  return res.status(200).json(new ApiResponse(200, result, "Users fetched"));
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await getUserByIdService({
    userId: req.validated.params.id,
  });

  return res.status(200).json(new ApiResponse(200, { user }, "User fetched"));
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await updateUserService({
    userId: req.validated.params.id,
    payload: req.validated.body,
    actorId: req.user?._id,
    req,
  });

  return res.status(200).json(new ApiResponse(200, { user }, "User updated"));
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await updateUserStatusService({
    userId: req.validated.params.id,
    status: req.validated.body.status,
    actorId: req.user?._id,
    req,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User status updated"));
});

export const assignUserRoles = asyncHandler(async (req, res) => {
  const user = await assignUserRolesService({
    userId: req.validated.params.id,
    roleIds: req.validated.body.roles,
    actorId: req.user?._id,
    req,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User roles updated"));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const result = await deleteUserService({
    userId: req.validated.params.id,
    actorId: req.user?._id,
    req,
  });

  return res.status(200).json(new ApiResponse(200, result, "User deleted"));
});