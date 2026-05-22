import mongoose from "mongoose";

import { ApiError } from "../../utils/api-error.js";
import { STATUS } from "../../constants/status.js";
import { SYSTEM_ROLES } from "../../constants/roles.js";

import { Group } from "./group.model.js";
import { User } from "../users/user.model.js";
import { Role } from "../roles/role.model.js";
import { createAuditLog } from "../audits/audit.service.js";

import "../departments/department.model.js";
import "../permissions/permission.model.js";

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const isSuperAdminRole = (role) => {
  return (
    Boolean(role?.isSystemRole) ||
    role?.code === SYSTEM_ROLES.SUPER_ADMIN ||
    role?.code === "SUPER_ADMIN" ||
    role?.code === "SUPERADMIN"
  );
};

const getPopulatedGroupById = async (groupId) => {
  return Group.findById(groupId)
    .populate("users", "name email status department isSuperAdmin")
    .populate({
      path: "users",
      populate: {
        path: "department",
        select: "name code status",
      },
    })
    .populate("roles", "name code status isSystemRole")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .lean();
};

const getUserSummary = (users = []) => {
  return users.map((user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    status: user.status,
    isSuperAdmin: user.isSuperAdmin,
  }));
};

const getRoleSummary = (roles = []) => {
  return roles.map((role) => ({
    _id: role._id,
    name: role.name,
    code: role.code,
    status: role.status,
    isSystemRole: role.isSystemRole,
  }));
};

const validateUserIds = async (userIds = []) => {
  const uniqueUserIds = Array.from(new Set(userIds));

  if (uniqueUserIds.length === 0) {
    return [];
  }

  const users = await User.find({
    _id: {
      $in: uniqueUserIds.map((id) => toObjectId(id)),
    },
    status: STATUS.ACTIVE,
  }).select("_id name email status isSuperAdmin department");

  if (users.length !== uniqueUserIds.length) {
    throw new ApiError(400, "One or more users are invalid or inactive");
  }

  const hasSuperAdminUser = users.some((user) => user.isSuperAdmin);

  if (hasSuperAdminUser) {
    throw new ApiError(400, "Super Admin users cannot be assigned to groups");
  }

  return users;
};

const validateGroupRoleIds = async (roleIds = []) => {
  const uniqueRoleIds = Array.from(new Set(roleIds));

  if (uniqueRoleIds.length === 0) {
    return [];
  }

  const roles = await Role.find({
    _id: {
      $in: uniqueRoleIds.map((id) => toObjectId(id)),
    },
    status: STATUS.ACTIVE,
  }).select("_id name code status isSystemRole");

  if (roles.length !== uniqueRoleIds.length) {
    throw new ApiError(400, "One or more roles are invalid or inactive");
  }

  const hasSuperAdminRole = roles.some((role) => isSuperAdminRole(role));

  if (hasSuperAdminRole) {
    throw new ApiError(400, "Super Admin role cannot be assigned to groups");
  }

  return roles;
};

const assertUniqueGroupNameAndCode = async ({
  name,
  code,
  excludeGroupId = null,
}) => {
  const conditions = [];

  if (name) {
    conditions.push({
      name: name.trim(),
    });
  }

  if (code) {
    conditions.push({
      code: code.trim().toUpperCase(),
    });
  }

  if (!conditions.length) {
    return;
  }

  const filter = {
    $or: conditions,
  };

  if (excludeGroupId) {
    filter._id = {
      $ne: excludeGroupId,
    };
  }

  const duplicateGroup = await Group.findOne(filter);

  if (!duplicateGroup) {
    return;
  }

  if (name && duplicateGroup.name.toLowerCase() === name.trim().toLowerCase()) {
    throw new ApiError(409, "Group name already exists");
  }

  if (code && duplicateGroup.code === code.trim().toUpperCase()) {
    throw new ApiError(409, "Group code already exists");
  }
};

export const createGroupService = async ({ payload, actorId, req }) => {
  await assertUniqueGroupNameAndCode({
    name: payload.name,
    code: payload.code,
  });

  const validUsers = await validateUserIds(payload.users);
  const validRoles = await validateGroupRoleIds(payload.roles);

  const group = await Group.create({
    name: payload.name,
    code: payload.code,
    description: payload.description || "",
    users: validUsers.map((user) => user._id),
    roles: validRoles.map((role) => role._id),
    status: payload.status || STATUS.ACTIVE,
    createdBy: actorId || null,
    updatedBy: actorId || null,
  });

  await createAuditLog({
    req,
    module: "GROUP",
    action: "CREATE",
    entityType: "Group",
    entityId: group._id,
    description: `Group created: ${group.name}`,
    status: "success",
    metadata: {
      groupId: group._id,
      name: group.name,
      code: group.code,
      status: group.status,
      users: getUserSummary(validUsers),
      roles: getRoleSummary(validRoles),
    },
  });

  return getPopulatedGroupById(group._id);
};

export const getGroupsService = async ({
  search = "",
  status = "all",
  user = "all",
  role = "all",
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  const filter = {};

  if (status !== "all") {
    filter.status = status;
  }

  if (user !== "all") {
    filter.users = toObjectId(user);
  }

  if (role !== "all") {
    filter.roles = toObjectId(role);
  }

  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        code: {
          $regex: search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const skip = (page - 1) * limit;

  const sort = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  const [groups, total] = await Promise.all([
    Group.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("users", "name email status isSuperAdmin")
      .populate("roles", "name code status isSystemRole")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .lean(),

    Group.countDocuments(filter),
  ]);

  return {
    groups,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

export const getGroupByIdService = async ({ groupId }) => {
  const group = await getPopulatedGroupById(groupId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  return {
    ...group,
    stats: {
      usersCount: group.users?.length || 0,
      rolesCount: group.roles?.length || 0,
    },
  };
};

export const updateGroupService = async ({
  groupId,
  payload,
  actorId,
  req,
}) => {
  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  await assertUniqueGroupNameAndCode({
    name: payload.name,
    code: payload.code,
    excludeGroupId: groupId,
  });

  const previousGroup = {
    name: group.name,
    code: group.code,
    description: group.description,
    status: group.status,
  };

  if (payload.name !== undefined) {
    group.name = payload.name;
  }

  if (payload.code !== undefined) {
    group.code = payload.code;
  }

  if (payload.description !== undefined) {
    group.description = payload.description;
  }

  if (payload.status !== undefined) {
    group.status = payload.status;
  }

  group.updatedBy = actorId || null;

  await group.save();

  await createAuditLog({
    req,
    module: "GROUP",
    action: "UPDATE",
    entityType: "Group",
    entityId: group._id,
    description: `Group updated: ${group.name}`,
    status: "success",
    metadata: {
      groupId: group._id,
      before: previousGroup,
      after: {
        name: group.name,
        code: group.code,
        description: group.description,
        status: group.status,
      },
      changedFields: Object.keys(payload),
    },
  });

  return getPopulatedGroupById(group._id);
};

export const assignGroupUsersService = async ({
  groupId,
  userIds,
  actorId,
  req,
}) => {
  const group = await Group.findById(groupId).populate(
    "users",
    "name email status isSuperAdmin"
  );

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  const validUsers = await validateUserIds(userIds);

  const previousUsers = getUserSummary(group.users || []);

  group.users = validUsers.map((user) => user._id);
  group.updatedBy = actorId || null;

  await group.save();

  await createAuditLog({
    req,
    module: "GROUP",
    action: "USERS_ASSIGNED",
    entityType: "Group",
    entityId: group._id,
    description: `Group users updated: ${group.name}`,
    status: "success",
    metadata: {
      groupId: group._id,
      groupName: group.name,
      before: previousUsers,
      after: getUserSummary(validUsers),
    },
  });

  return getPopulatedGroupById(group._id);
};

export const assignGroupRolesService = async ({
  groupId,
  roleIds,
  actorId,
  req,
}) => {
  const group = await Group.findById(groupId).populate(
    "roles",
    "name code status isSystemRole"
  );

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  const validRoles = await validateGroupRoleIds(roleIds);

  const previousRoles = getRoleSummary(group.roles || []);

  group.roles = validRoles.map((role) => role._id);
  group.updatedBy = actorId || null;

  await group.save();

  await createAuditLog({
    req,
    module: "GROUP",
    action: "ROLES_ASSIGNED",
    entityType: "Group",
    entityId: group._id,
    description: `Group roles updated: ${group.name}`,
    status: "success",
    metadata: {
      groupId: group._id,
      groupName: group.name,
      before: previousRoles,
      after: getRoleSummary(validRoles),
    },
  });

  return getPopulatedGroupById(group._id);
};

export const deleteGroupService = async ({ groupId, req }) => {
  const group = await Group.findById(groupId)
    .populate("users", "name email status isSuperAdmin")
    .populate("roles", "name code status isSystemRole");

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  await Group.deleteOne({
    _id: toObjectId(groupId),
  });

  await createAuditLog({
    req,
    module: "GROUP",
    action: "DELETE",
    entityType: "Group",
    entityId: groupId,
    description: `Group deleted: ${group.name}`,
    status: "success",
    metadata: {
      deletedGroup: {
        _id: group._id,
        name: group.name,
        code: group.code,
        status: group.status,
        users: getUserSummary(group.users || []),
        roles: getRoleSummary(group.roles || []),
      },
    },
  });

  return {
    deletedGroupId: groupId,
  };
};