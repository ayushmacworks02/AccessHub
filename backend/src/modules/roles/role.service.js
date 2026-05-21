import mongoose from "mongoose";
import { ApiError } from "../../utils/api-error.js";
import { STATUS } from "../../constants/status.js";
import { SYSTEM_ROLES } from "../../constants/roles.js";
import { Role } from "./role.model.js";
import { Permission } from "../permissions/permission.model.js";
import { Department } from "../departments/department.model.js";
import { User } from "../users/user.model.js";
import { createAuditLog } from "../audits/audit.service.js";

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const normalizeObjectIdArray = (ids = []) => {
  return Array.from(new Set(ids.map((id) => id.toString())));
};

const getPopulatedRoleById = async (roleId) => {
  return Role.findById(roleId)
    .populate("department", "name code status")
    .populate("permissions", "module action key label description status")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .lean();
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
    throw new ApiError(400, "Cannot assign inactive department to role");
  }

  return department;
};

const validatePermissionIds = async (permissionIds = []) => {
  const uniquePermissionIds = Array.from(new Set(permissionIds));

  if (uniquePermissionIds.length === 0) {
    return [];
  }

  const permissions = await Permission.find({
    _id: {
      $in: uniquePermissionIds.map((id) => toObjectId(id)),
    },
    status: STATUS.ACTIVE,
  }).select("_id key module action label");

  if (permissions.length !== uniquePermissionIds.length) {
    throw new ApiError(400, "One or more permissions are invalid or inactive");
  }

  return permissions;
};

const getPermissionSummary = (permissions = []) => {
  return permissions.map((permission) => ({
    _id: permission._id,
    key: permission.key,
    module: permission.module,
    action: permission.action,
    label: permission.label,
  }));
};

const assertRoleCanModifyPermissions = (role) => {
  if (role.isSystemRole && role.code === SYSTEM_ROLES.SUPER_ADMIN) {
    throw new ApiError(
      400,
      "Super Admin role permissions are managed by the system"
    );
  }
};

export const createRoleService = async ({ payload, actorId, req }) => {
  await validateDepartmentIfProvided(payload.department);

  const existingRoleByCode = await Role.findOne({
    code: payload.code.trim().toUpperCase(),
  });

  if (existingRoleByCode) {
    throw new ApiError(409, "Role code already exists");
  }

  const existingRoleByNameAndDepartment = await Role.findOne({
    name: payload.name.trim(),
    department: payload.department ? toObjectId(payload.department) : null,
  });

  if (existingRoleByNameAndDepartment) {
    throw new ApiError(409, "Role name already exists for this department");
  }

  const validPermissions = await validatePermissionIds(payload.permissions);

  const role = await Role.create({
    name: payload.name,
    code: payload.code,
    description: payload.description || "",
    department: payload.department || null,
    permissions: validPermissions.map((permission) => permission._id),
    isSystemRole: false,
    status: payload.status || STATUS.ACTIVE,
    createdBy: actorId || null,
    updatedBy: actorId || null,
  });

  await createAuditLog({
    req,
    module: "ROLE",
    action: "CREATE",
    entityType: "Role",
    entityId: role._id,
    description: `Role created: ${role.name}`,
    status: "success",
    metadata: {
      roleId: role._id,
      name: role.name,
      code: role.code,
      department: role.department,
      status: role.status,
      permissions: getPermissionSummary(validPermissions),
    },
  });

  return getPopulatedRoleById(role._id);
};

export const getRolesService = async ({
  search = "",
  status = "all",
  department = "all",
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

  const [roles, total] = await Promise.all([
    Role.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("department", "name code status")
      .populate("permissions", "module action key label status")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .lean(),

    Role.countDocuments(filter),
  ]);

  return {
    roles,
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

export const getRoleByIdService = async ({ roleId }) => {
  const role = await getPopulatedRoleById(roleId);

  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  const usersCount = await User.countDocuments({
    roles: roleId,
  });

  return {
    ...role,
    stats: {
      usersCount,
      permissionsCount: role.permissions?.length || 0,
    },
  };
};

export const updateRoleService = async ({ roleId, payload, actorId, req }) => {
  const role = await Role.findById(roleId);

  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  const previousRole = {
    name: role.name,
    code: role.code,
    description: role.description,
    department: role.department,
    status: role.status,
    isSystemRole: role.isSystemRole,
  };

  if (role.isSystemRole && role.code === SYSTEM_ROLES.SUPER_ADMIN) {
    const restrictedFields = ["code", "status", "department"];

    const hasRestrictedField = restrictedFields.some(
      (field) => payload[field] !== undefined
    );

    if (hasRestrictedField) {
      throw new ApiError(
        400,
        "System role code, status, or department cannot be modified"
      );
    }
  }

  if (payload.department !== undefined && payload.department !== null) {
    await validateDepartmentIfProvided(payload.department);
  }

  if (payload.code) {
    const duplicateCode = await Role.findOne({
      _id: {
        $ne: roleId,
      },
      code: payload.code.trim().toUpperCase(),
    });

    if (duplicateCode) {
      throw new ApiError(409, "Role code already exists");
    }
  }

  if (payload.name || payload.department !== undefined) {
    const nextName = payload.name || role.name;
    const nextDepartment =
      payload.department !== undefined ? payload.department : role.department;

    const duplicateNameAndDepartment = await Role.findOne({
      _id: {
        $ne: roleId,
      },
      name: nextName.trim(),
      department: nextDepartment ? toObjectId(nextDepartment) : null,
    });

    if (duplicateNameAndDepartment) {
      throw new ApiError(409, "Role name already exists for this department");
    }
  }

  if (payload.name !== undefined) {
    role.name = payload.name;
  }

  if (payload.code !== undefined) {
    role.code = payload.code;
  }

  if (payload.description !== undefined) {
    role.description = payload.description;
  }

  if (payload.department !== undefined) {
    role.department = payload.department || null;
  }

  if (payload.status !== undefined) {
    role.status = payload.status;
  }

  role.updatedBy = actorId || null;

  await role.save();

  await createAuditLog({
    req,
    module: "ROLE",
    action: "UPDATE",
    entityType: "Role",
    entityId: role._id,
    description: `Role updated: ${role.name}`,
    status: "success",
    metadata: {
      roleId: role._id,
      before: previousRole,
      after: {
        name: role.name,
        code: role.code,
        description: role.description,
        department: role.department,
        status: role.status,
        isSystemRole: role.isSystemRole,
      },
      changedFields: Object.keys(payload),
    },
  });

  return getPopulatedRoleById(role._id);
};

export const assignRolePermissionsService = async ({
  roleId,
  permissionIds,
  actorId,
  req,
}) => {
  const role = await Role.findById(roleId).populate(
    "permissions",
    "module action key label status"
  );

  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  assertRoleCanModifyPermissions(role);

  const previousPermissions = getPermissionSummary(role.permissions || []);
  const validPermissions = await validatePermissionIds(permissionIds);

  role.permissions = validPermissions.map((permission) => permission._id);
  role.updatedBy = actorId || null;

  await role.save();

  await createAuditLog({
    req,
    module: "ROLE",
    action: "PERMISSIONS_REPLACED",
    entityType: "Role",
    entityId: role._id,
    description: `Role permissions replaced: ${role.name}`,
    status: "success",
    metadata: {
      roleId: role._id,
      roleName: role.name,
      roleCode: role.code,
      before: previousPermissions,
      after: getPermissionSummary(validPermissions),
    },
  });

  return getPopulatedRoleById(role._id);
};

export const appendRolePermissionsService = async ({
  roleId,
  permissionIds,
  actorId,
  req,
}) => {
  const role = await Role.findById(roleId).populate(
    "permissions",
    "module action key label status"
  );

  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  assertRoleCanModifyPermissions(role);

  const validPermissions = await validatePermissionIds(permissionIds);

  const existingPermissionIds = normalizeObjectIdArray(
    role.permissions.map((permission) => permission._id)
  );
  const incomingPermissionIds = normalizeObjectIdArray(
    validPermissions.map((permission) => permission._id)
  );

  const mergedPermissionIds = Array.from(
    new Set([...existingPermissionIds, ...incomingPermissionIds])
  );

  const actuallyAddedPermissionIds = incomingPermissionIds.filter(
    (permissionId) => !existingPermissionIds.includes(permissionId)
  );

  role.permissions = mergedPermissionIds.map((id) => toObjectId(id));
  role.updatedBy = actorId || null;

  await role.save();

  await createAuditLog({
    req,
    module: "ROLE",
    action: "PERMISSIONS_APPENDED",
    entityType: "Role",
    entityId: role._id,
    description: `Role permissions appended: ${role.name}`,
    status: "success",
    metadata: {
      roleId: role._id,
      roleName: role.name,
      roleCode: role.code,
      requestedPermissions: getPermissionSummary(validPermissions),
      addedPermissionIds: actuallyAddedPermissionIds,
      totalPermissionsAfter: mergedPermissionIds.length,
    },
  });

  return getPopulatedRoleById(role._id);
};

export const removeRolePermissionsService = async ({
  roleId,
  permissionIds,
  actorId,
  req,
}) => {
  const role = await Role.findById(roleId).populate(
    "permissions",
    "module action key label status"
  );

  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  assertRoleCanModifyPermissions(role);

  const permissionIdsToRemove = normalizeObjectIdArray(permissionIds);

  const existingPermissions = role.permissions || [];
  const existingPermissionIds = normalizeObjectIdArray(
    existingPermissions.map((permission) => permission._id)
  );

  const removedPermissions = existingPermissions.filter((permission) =>
    permissionIdsToRemove.includes(permission._id.toString())
  );

  const remainingPermissionIds = existingPermissionIds.filter(
    (permissionId) => !permissionIdsToRemove.includes(permissionId)
  );

  role.permissions = remainingPermissionIds.map((id) => toObjectId(id));
  role.updatedBy = actorId || null;

  await role.save();

  await createAuditLog({
    req,
    module: "ROLE",
    action: "PERMISSIONS_REMOVED",
    entityType: "Role",
    entityId: role._id,
    description: `Role permissions removed: ${role.name}`,
    status: "success",
    metadata: {
      roleId: role._id,
      roleName: role.name,
      roleCode: role.code,
      requestedPermissionIdsToRemove: permissionIdsToRemove,
      removedPermissions: getPermissionSummary(removedPermissions),
      totalPermissionsAfter: remainingPermissionIds.length,
    },
  });

  return getPopulatedRoleById(role._id);
};

export const deleteRoleService = async ({ roleId, req }) => {
  const role = await Role.findById(roleId).populate(
    "permissions",
    "module action key label status"
  );

  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  if (role.isSystemRole) {
    throw new ApiError(400, "System roles cannot be deleted");
  }

  const assignedUsersCount = await User.countDocuments({
    roles: roleId,
  });

  if (assignedUsersCount > 0) {
    throw new ApiError(
      409,
      "Role cannot be deleted because users are assigned to it",
      [
        {
          assignedUsersCount,
        },
      ]
    );
  }

  await Role.deleteOne({
    _id: toObjectId(roleId),
  });

  await createAuditLog({
    req,
    module: "ROLE",
    action: "DELETE",
    entityType: "Role",
    entityId: roleId,
    description: `Role deleted: ${role.name}`,
    status: "success",
    metadata: {
      deletedRole: {
        _id: role._id,
        name: role.name,
        code: role.code,
        department: role.department,
        status: role.status,
        permissions: getPermissionSummary(role.permissions || []),
      },
    },
  });

  return {
    deletedRoleId: roleId,
  };
};