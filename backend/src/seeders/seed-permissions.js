import { Permission } from "../modules/permissions/permission.model.js";
import { getAllPermissionsFromRegistry } from "../constants/permission-registry.js";

export const seedPermissions = async () => {
  const permissions = getAllPermissionsFromRegistry();

  for (const permission of permissions) {
    await Permission.findOneAndUpdate(
      {
        key: permission.key,
      },
      {
        $set: {
          module: permission.module,
          action: permission.action,
          key: permission.key,
          label: permission.label,
          description: permission.description,
          isSystemPermission: permission.isSystemPermission,
          status: permission.status,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      }
    );
  }

  console.log(`Seeded ${permissions.length} permissions`);
};