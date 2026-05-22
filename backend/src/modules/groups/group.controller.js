import { ApiResponse } from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  assignGroupRolesService,
  assignGroupUsersService,
  createGroupService,
  deleteGroupService,
  getGroupByIdService,
  getGroupsService,
  updateGroupService,
} from "./group.service.js";

export const createGroup = asyncHandler(async (req, res) => {
  const group = await createGroupService({
    payload: req.validated.body,
    actorId: req.user?._id,
    req,
  });

  return res.status(201).json(new ApiResponse(201, { group }, "Group created"));
});

export const getGroups = asyncHandler(async (req, res) => {
  const result = await getGroupsService(req.validated.query);

  return res.status(200).json(new ApiResponse(200, result, "Groups fetched"));
});

export const getGroupById = asyncHandler(async (req, res) => {
  const group = await getGroupByIdService({
    groupId: req.validated.params.id,
  });

  return res.status(200).json(new ApiResponse(200, { group }, "Group fetched"));
});

export const updateGroup = asyncHandler(async (req, res) => {
  const group = await updateGroupService({
    groupId: req.validated.params.id,
    payload: req.validated.body,
    actorId: req.user?._id,
    req,
  });

  return res.status(200).json(new ApiResponse(200, { group }, "Group updated"));
});

export const assignGroupUsers = asyncHandler(async (req, res) => {
  const group = await assignGroupUsersService({
    groupId: req.validated.params.id,
    userIds: req.validated.body.users,
    actorId: req.user?._id,
    req,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { group }, "Group users updated"));
});

export const assignGroupRoles = asyncHandler(async (req, res) => {
  const group = await assignGroupRolesService({
    groupId: req.validated.params.id,
    roleIds: req.validated.body.roles,
    actorId: req.user?._id,
    req,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { group }, "Group roles updated"));
});

export const deleteGroup = asyncHandler(async (req, res) => {
  const result = await deleteGroupService({
    groupId: req.validated.params.id,
    req,
  });

  return res.status(200).json(new ApiResponse(200, result, "Group deleted"));
});