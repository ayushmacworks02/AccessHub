import mongoose from "mongoose";
import { ApiError } from "../../utils/api-error.js";
import { STATUS } from "../../constants/status.js";
import { SYSTEM_ROLES } from "../../constants/roles.js";
import { hashPassword } from "../../utils/password.js";
import { User } from "./user.model.js";
import { Role } from "../roles/role.model.js";
import { Department } from "../departments/department.model.js";
import { createAuditLog } from "../audits/audit.service.js";

import "../permissions/permission.model.js";

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const getPopulatedUserById = async (userId) => {
  return User.findById(userId)
    .select("-password")
    .populate("department", "name code status")
    .populate({
      path: "roles",
      select: "name code status permissions isSystemRole",
      populate: {
        path: "permissions",
        select: "module action key label status",
      },
    })
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .lean();
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

const validateDepartmentIfProvided = async (departmentId) => {
  if (!departmentId) {
    return null;
  }

  const department = await Department.findById(departmentId);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  if (department.status !== STATUS.ACTIVE) {
    throw new ApiError(400, "Cannot assign inactive department to user");
  }

  return department;
};

const validateAssignableRoleIds = async (roleIds = []) => {
  const uniqueRoleIds = Array.from(new Set(roleIds));

  if (uniqueRoleIds.length === 0) {
    return [];
  }

  const roles = await Role.find({
    _id: {
      $in: uniqueRoleIds.map((id) => toObjectId(id)),
    },
    status: STATUS.ACTIVE,
  }).select("_id name code isSystemRole status");

  if (roles.length !== uniqueRoleIds.length) {
    throw new ApiError(400, "One or more roles are invalid or inactive");
  }

  const hasSystemRole = roles.some(
    (role) => role.isSystemRole || role.code === SYSTEM_ROLES.SUPER_ADMIN
  );

  if (hasSystemRole) {
    throw new ApiError(400, "System roles cannot be assigned manually");
  }

  return roles;
};

const assertCanModifyUser = ({ targetUser }) => {
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }
};

const assertCanDeleteUser = ({ targetUser, actorId }) => {
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  if (targetUser.isSuperAdmin) {
    throw new ApiError(400, "Super Admin user cannot be deleted");
  }

  if (actorId && targetUser._id.toString() === actorId.toString()) {
    throw new ApiError(400, "You cannot delete your own account");
  }
};

const assertCanChangeStatus = ({ targetUser, actorId, nextStatus }) => {
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  if (targetUser.isSuperAdmin) {
    throw new ApiError(400, "Super Admin status cannot be changed");
  }

  if (
    actorId &&
    targetUser._id.toString() === actorId.toString() &&
    nextStatus !== STATUS.ACTIVE
  ) {
    throw new ApiError(400, "You cannot deactivate your own account");
  }
};

const assertCanAssignRoles = ({ targetUser }) => {
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  if (targetUser.isSuperAdmin) {
    throw new ApiError(400, "Super Admin roles cannot be modified");
  }
};

export const createUserService = async ({ payload, actorId, req }) => {
  await validateDepartmentIfProvided(payload.department);

  const validRoles = await validateAssignableRoleIds(payload.roles);

  const existingUser = await User.findOne({
    email: payload.email.toLowerCase(),
  });

  if (existingUser) {
    throw new ApiError(409, "User email already exists");
  }

  const hashedPassword = await hashPassword(payload.password);

  const user = await User.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    password: hashedPassword,
    department: payload.department || null,
    roles: validRoles.map((role) => role._id),
    status: payload.status || STATUS.ACTIVE,
    isSuperAdmin: false,
    createdBy: actorId || null,
    updatedBy: actorId || null,
  });

  await createAuditLog({
    req,
    module: "USER",
    action: "CREATE",
    entityType: "User",
    entityId: user._id,
    description: `User created: ${user.email}`,
    status: "success",
    metadata: {
      userId: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      status: user.status,
      roles: getRoleSummary(validRoles),
    },
  });

  return getPopulatedUserById(user._id);
};

export const getUsersService = async ({
  search = "",
  status = "all",
  department = "all",
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

  if (department !== "all") {
    filter.department = toObjectId(department);
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
        email: {
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

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("department", "name code status")
      .populate("roles", "name code status isSystemRole")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .lean(),

    User.countDocuments(filter),
  ]);

  return {
    users,
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

export const getUserByIdService = async ({ userId }) => {
  const user = await getPopulatedUserById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

export const updateUserService = async ({ userId, payload, actorId, req }) => {
  const user = await User.findById(userId).select("+password");

  assertCanModifyUser({
    targetUser: user,
    actorId,
  });

  if (user.isSuperAdmin && payload.department !== undefined) {
    throw new ApiError(400, "Super Admin department cannot be modified");
  }

  const previousUser = {
    name: user.name,
    email: user.email,
    department: user.department,
    status: user.status,
    passwordChangedAt: user.passwordChangedAt,
  };

  if (payload.department !== undefined && payload.department !== null) {
    await validateDepartmentIfProvided(payload.department);
  }

  if (payload.email) {
    const duplicateEmail = await User.findOne({
      _id: {
        $ne: userId,
      },
      email: payload.email.toLowerCase(),
    });

    if (duplicateEmail) {
      throw new ApiError(409, "User email already exists");
    }
  }

  const passwordWasChanged = payload.password !== undefined;

  if (payload.name !== undefined) {
    user.name = payload.name;
  }

  if (payload.email !== undefined) {
    user.email = payload.email.toLowerCase();
  }

  if (passwordWasChanged) {
    user.password = await hashPassword(payload.password);
    user.passwordChangedAt = new Date();
  }

  if (payload.department !== undefined) {
    user.department = payload.department || null;
  }

  user.updatedBy = actorId || null;

  await user.save();

  await createAuditLog({
    req,
    module: "USER",
    action: "UPDATE",
    entityType: "User",
    entityId: user._id,
    description: `User updated: ${user.email}`,
    status: "success",
    metadata: {
      userId: user._id,
      before: previousUser,
      after: {
        name: user.name,
        email: user.email,
        department: user.department,
        status: user.status,
        passwordChangedAt: user.passwordChangedAt,
      },
      changedFields: Object.keys(payload).map((field) =>
        field === "password" ? "passwordChanged" : field
      ),
      passwordChanged: passwordWasChanged,
    },
  });

  return getPopulatedUserById(user._id);
};

export const updateUserStatusService = async ({
  userId,
  status,
  actorId,
  req,
}) => {
  const user = await User.findById(userId);

  assertCanChangeStatus({
    targetUser: user,
    actorId,
    nextStatus: status,
  });

  const previousStatus = user.status;

  user.status = status;
  user.updatedBy = actorId || null;

  await user.save();

  await createAuditLog({
    req,
    module: "USER",
    action: "STATUS_UPDATE",
    entityType: "User",
    entityId: user._id,
    description: `User status updated: ${user.email}`,
    status: "success",
    metadata: {
      userId: user._id,
      email: user.email,
      previousStatus,
      nextStatus: user.status,
    },
  });

  return getPopulatedUserById(user._id);
};

export const assignUserRolesService = async ({
  userId,
  roleIds,
  actorId,
  req,
}) => {
  const user = await User.findById(userId).populate(
    "roles",
    "name code status isSystemRole"
  );

  assertCanAssignRoles({
    targetUser: user,
  });

  const previousRoles = getRoleSummary(user.roles || []);
  const validRoles = await validateAssignableRoleIds(roleIds);

  user.roles = validRoles.map((role) => role._id);
  user.updatedBy = actorId || null;

  await user.save();

  await createAuditLog({
    req,
    module: "USER",
    action: "ROLES_ASSIGNED",
    entityType: "User",
    entityId: user._id,
    description: `User roles updated: ${user.email}`,
    status: "success",
    metadata: {
      userId: user._id,
      email: user.email,
      before: previousRoles,
      after: getRoleSummary(validRoles),
    },
  });

  return getPopulatedUserById(user._id);
};

export const deleteUserService = async ({ userId, actorId, req }) => {
  const user = await User.findById(userId)
    .populate("department", "name code status")
    .populate("roles", "name code status isSystemRole");

  assertCanDeleteUser({
    targetUser: user,
    actorId,
  });

  await User.deleteOne({
    _id: toObjectId(userId),
  });

  await createAuditLog({
    req,
    module: "USER",
    action: "DELETE",
    entityType: "User",
    entityId: userId,
    description: `User deleted: ${user.email}`,
    status: "success",
    metadata: {
      deletedUser: {
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        roles: getRoleSummary(user.roles || []),
        status: user.status,
      },
    },
  });

  return {
    deletedUserId: userId,
  };
};