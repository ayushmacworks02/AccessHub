export const hasPermission = (user, requiredPermission) => {
  if (!requiredPermission) {
    return true;
  }

  if (!user) {
    return false;
  }

  if (user.isSuperAdmin) {
    return true;
  }

  const permissions = user.permissions || [];

  if (permissions.includes("*")) {
    return true;
  }

  return permissions.includes(requiredPermission);
};

export const hasAnyPermission = (user, requiredPermissions = []) => {
  if (!requiredPermissions.length) {
    return true;
  }

  if (!user) {
    return false;
  }

  if (user.isSuperAdmin) {
    return true;
  }

  const permissions = user.permissions || [];

  if (permissions.includes("*")) {
    return true;
  }

  return requiredPermissions.some((permission) =>
    permissions.includes(permission)
  );
};

export const hasAllPermissions = (user, requiredPermissions = []) => {
  if (!requiredPermissions.length) {
    return true;
  }

  if (!user) {
    return false;
  }

  if (user.isSuperAdmin) {
    return true;
  }

  const permissions = user.permissions || [];

  if (permissions.includes("*")) {
    return true;
  }

  return requiredPermissions.every((permission) =>
    permissions.includes(permission)
  );
};