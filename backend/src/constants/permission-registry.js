export const PERMISSION_REGISTRY = {
  USER: {
    label: "Users",
    actions: {
      CREATE: "Create users",
      READ: "View users",
      UPDATE: "Update users",
      DELETE: "Delete users",
      CHANGE_STATUS: "Activate or deactivate users",
      ASSIGN_ROLE: "Assign roles to users",
    },
  },

  ROLE: {
    label: "Roles",
    actions: {
      CREATE: "Create roles",
      READ: "View roles",
      UPDATE: "Update roles",
      DELETE: "Delete roles",
      ASSIGN_PERMISSION: "Assign permissions to roles",
    },
  },

  GROUP: {
    label: "Groups",
    actions: {
      CREATE: "Create groups",
      READ: "View groups",
      UPDATE: "Update groups",
      DELETE: "Delete groups",
      MANAGE_USERS: "Manage group users",
      MANAGE_ROLES: "Manage group roles",
    },
  },

  DEPARTMENT: {
    label: "Departments",
    actions: {
      CREATE: "Create departments",
      READ: "View departments",
      UPDATE: "Update departments",
      DELETE: "Delete departments",
    },
  },

  PERMISSION: {
    label: "Permissions",
    actions: {
      READ: "View permissions",
    },
  },

  AUDIT: {
    label: "Audit Logs",
    actions: {
      READ: "View audit logs",
    },
  },
};

export const buildPermissionKey = (module, action) => {
  return `${module}:${action}`;
};

export const getAllPermissionsFromRegistry = () => {
  const permissions = [];

  Object.entries(PERMISSION_REGISTRY).forEach(([module, config]) => {
    Object.entries(config.actions).forEach(([action, label]) => {
      permissions.push({
        module,
        action,
        key: buildPermissionKey(module, action),
        label,
        description: label,
        isSystemPermission: true,
        status: "active",
      });
    });
  });

  return permissions;
};