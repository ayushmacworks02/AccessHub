import { ApiError } from "../utils/api-error.js";

export const requirePermission = (requiredPermission) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized"));
    }

    if (req.user.isSuperAdmin) {
      return next();
    }

    const userPermissions = req.userPermissions || [];

    if (!userPermissions.includes(requiredPermission)) {
      return next(
        new ApiError(403, "You do not have permission to perform this action", [
          {
            requiredPermission,
          },
        ])
      );
    }

    next();
  };
};

export const requireAnyPermission = (requiredPermissions = []) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized"));
    }

    if (req.user.isSuperAdmin) {
      return next();
    }

    const userPermissions = req.userPermissions || [];

    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return next(
        new ApiError(403, "You do not have permission to perform this action", [
          {
            requiredPermissions,
          },
        ])
      );
    }

    next();
  };
};