import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../modules/users/user.model.js";
import { Group } from "../modules/groups/group.model.js";
import { STATUS } from "../constants/status.js";
import { verifyAccessToken } from "../modules/auth/token.service.js";

import "../modules/roles/role.model.js";
import "../modules/permissions/permission.model.js";
import "../modules/departments/department.model.js";

const addRolePermissionsToSet = ({ roles = [], permissionsSet }) => {
  roles?.forEach((role) => {
    if (!role || role.status !== STATUS.ACTIVE) {
      return;
    }

    role.permissions?.forEach((permission) => {
      if (permission?.status === STATUS.ACTIVE && permission?.key) {
        permissionsSet.add(permission.key);
      }
    });
  });
};

const getUserActiveGroupsWithRoles = async (userId) => {
  return Group.find({
    users: userId,
    status: STATUS.ACTIVE,
  })
    .select("name code status roles")
    .populate({
      path: "roles",
      select: "name code status permissions isSystemRole",
      populate: {
        path: "permissions",
        select: "module action key status",
      },
    });
};

export const authMiddleware = asyncHandler(async (req, _res, next) => {
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    throw new ApiError(401, "Unauthorized");
  }

  let decoded;

  try {
    decoded = verifyAccessToken(accessToken);
  } catch (_error) {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const user = await User.findById(decoded.userId)
    .select("-password")
    .populate({
      path: "roles",
      select: "name code status permissions isSystemRole",
      populate: {
        path: "permissions",
        select: "module action key status",
      },
    })
    .populate("department", "name code status");

  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  if (user.status !== STATUS.ACTIVE) {
    throw new ApiError(403, "User account is not active");
  }

  const permissions = new Set();

  if (user.isSuperAdmin) {
    req.user = user;
    req.userGroups = [];
    req.userPermissions = ["*"];
    return next();
  }

  addRolePermissionsToSet({
    roles: user.roles || [],
    permissionsSet: permissions,
  });

  const groups = await getUserActiveGroupsWithRoles(user._id);

  groups.forEach((group) => {
    addRolePermissionsToSet({
      roles: group.roles || [],
      permissionsSet: permissions,
    });
  });

  req.user = user;
  req.userGroups = groups;
  req.userPermissions = Array.from(permissions);

  next();
});