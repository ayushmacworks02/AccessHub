import mongoose from "mongoose";
import { ApiError } from "../../utils/api-error.js";
import { STATUS } from "../../constants/status.js";
import { Department } from "./department.model.js";
import { Role } from "../roles/role.model.js";
import { User } from "../users/user.model.js";
import { createAuditLog } from "../audits/audit.service.js";

export const createDepartmentService = async ({ payload, actorId, req }) => {
  const existingDepartment = await Department.findOne({
    $or: [
      { name: payload.name.trim() },
      { code: payload.code.trim().toUpperCase() },
    ],
  });

  if (existingDepartment) {
    if (existingDepartment.name.toLowerCase() === payload.name.toLowerCase()) {
      throw new ApiError(409, "Department name already exists");
    }

    if (existingDepartment.code === payload.code.toUpperCase()) {
      throw new ApiError(409, "Department code already exists");
    }
  }

  const department = await Department.create({
    name: payload.name,
    code: payload.code,
    description: payload.description || "",
    status: payload.status || STATUS.ACTIVE,
    createdBy: actorId || null,
    updatedBy: actorId || null,
  });

  await createAuditLog({
    req,
    module: "DEPARTMENT",
    action: "CREATE",
    entityType: "Department",
    entityId: department._id,
    description: `Department created: ${department.name}`,
    status: "success",
    metadata: {
      departmentId: department._id,
      name: department.name,
      code: department.code,
      status: department.status,
    },
  });

  return department;
};

export const getDepartmentsService = async ({
  search = "",
  status = "all",
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  const filter = {};

  if (status !== "all") {
    filter.status = status;
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

  const [departments, total] = await Promise.all([
    Department.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .lean(),

    Department.countDocuments(filter),
  ]);

  return {
    departments,
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

export const getDepartmentByIdService = async ({ departmentId }) => {
  const department = await Department.findById(departmentId)
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .lean();

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  const [usersCount, rolesCount] = await Promise.all([
    User.countDocuments({
      department: departmentId,
    }),
    Role.countDocuments({
      department: departmentId,
    }),
  ]);

  return {
    ...department,
    stats: {
      usersCount,
      rolesCount,
    },
  };
};

export const updateDepartmentService = async ({
  departmentId,
  payload,
  actorId,
  req,
}) => {
  const department = await Department.findById(departmentId);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  const previousDepartment = {
    name: department.name,
    code: department.code,
    description: department.description,
    status: department.status,
  };

  const duplicateConditions = [];

  if (payload.name) {
    duplicateConditions.push({
      name: payload.name.trim(),
    });
  }

  if (payload.code) {
    duplicateConditions.push({
      code: payload.code.trim().toUpperCase(),
    });
  }

  if (duplicateConditions.length > 0) {
    const duplicateDepartment = await Department.findOne({
      _id: {
        $ne: departmentId,
      },
      $or: duplicateConditions,
    });

    if (duplicateDepartment) {
      if (
        payload.name &&
        duplicateDepartment.name.toLowerCase() === payload.name.toLowerCase()
      ) {
        throw new ApiError(409, "Department name already exists");
      }

      if (
        payload.code &&
        duplicateDepartment.code === payload.code.toUpperCase()
      ) {
        throw new ApiError(409, "Department code already exists");
      }
    }
  }

  if (payload.name !== undefined) {
    department.name = payload.name;
  }

  if (payload.code !== undefined) {
    department.code = payload.code;
  }

  if (payload.description !== undefined) {
    department.description = payload.description;
  }

  if (payload.status !== undefined) {
    department.status = payload.status;
  }

  department.updatedBy = actorId || null;

  await department.save();

  await createAuditLog({
    req,
    module: "DEPARTMENT",
    action: "UPDATE",
    entityType: "Department",
    entityId: department._id,
    description: `Department updated: ${department.name}`,
    status: "success",
    metadata: {
      departmentId: department._id,
      before: previousDepartment,
      after: {
        name: department.name,
        code: department.code,
        description: department.description,
        status: department.status,
      },
      changedFields: Object.keys(payload),
    },
  });

  return Department.findById(department._id)
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .lean();
};

export const deleteDepartmentService = async ({ departmentId, req }) => {
  const department = await Department.findById(departmentId);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  const [assignedUsersCount, assignedRolesCount] = await Promise.all([
    User.countDocuments({
      department: departmentId,
    }),

    Role.countDocuments({
      department: departmentId,
    }),
  ]);

  if (assignedUsersCount > 0 || assignedRolesCount > 0) {
    throw new ApiError(
      409,
      "Department cannot be deleted because users or roles are assigned to it",
      [
        {
          assignedUsersCount,
          assignedRolesCount,
        },
      ]
    );
  }

  await Department.deleteOne({
    _id: new mongoose.Types.ObjectId(departmentId),
  });

  await createAuditLog({
    req,
    module: "DEPARTMENT",
    action: "DELETE",
    entityType: "Department",
    entityId: departmentId,
    description: `Department deleted: ${department.name}`,
    status: "success",
    metadata: {
      deletedDepartment: {
        _id: department._id,
        name: department.name,
        code: department.code,
        status: department.status,
      },
    },
  });

  return {
    deletedDepartmentId: departmentId,
  };
};