import { STATUS } from "../../constants/status.js";
import { PERMISSION_REGISTRY } from "../../constants/permission-registry.js";
import { Permission } from "./permission.model.js";

export const getGroupedPermissions = async () => {
  const permissions = await Permission.find({
    status: STATUS.ACTIVE,
  })
    .sort({
      module: 1,
      action: 1,
    })
    .lean();

  const groupedPermissionsMap = new Map();

  permissions.forEach((permission) => {
    const moduleConfig = PERMISSION_REGISTRY[permission.module];

    if (!groupedPermissionsMap.has(permission.module)) {
      groupedPermissionsMap.set(permission.module, {
        module: permission.module,
        label: moduleConfig?.label || permission.module,
        permissions: [],
      });
    }

    groupedPermissionsMap.get(permission.module).permissions.push({
      _id: permission._id,
      module: permission.module,
      action: permission.action,
      key: permission.key,
      label: permission.label,
      description: permission.description,
      status: permission.status,
      isSystemPermission: permission.isSystemPermission,
    });
  });

  return Array.from(groupedPermissionsMap.values());
};

export const getFlatPermissions = async () => {
  return Permission.find({
    status: STATUS.ACTIVE,
  })
    .select("_id module action key label description status isSystemPermission")
    .sort({
      module: 1,
      action: 1,
    })
    .lean();
};