import { env } from "../config/env.js";
import { STATUS } from "../constants/status.js";
import { SYSTEM_ROLES } from "../constants/roles.js";
import { hashPassword } from "../utils/password.js";
import { User } from "../modules/users/user.model.js";
import { Role } from "../modules/roles/role.model.js";
import { Permission } from "../modules/permissions/permission.model.js";

export const seedSuperAdmin = async () => {
  const allPermissions = await Permission.find({ status: STATUS.ACTIVE }).select(
    "_id"
  );

  const superAdminRole = await Role.findOneAndUpdate(
    {
      code: SYSTEM_ROLES.SUPER_ADMIN,
    },
    {
      $set: {
        name: "Super Admin",
        code: SYSTEM_ROLES.SUPER_ADMIN,
        description: "System role with full access to all permissions",
        permissions: allPermissions.map((permission) => permission._id),
        isSystemRole: true,
        status: STATUS.ACTIVE,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    }
  );

  const existingSuperAdmin = await User.findOne({
    email: env.superAdminEmail.toLowerCase(),
  });

  if (existingSuperAdmin) {
    existingSuperAdmin.name = env.superAdminName;
    existingSuperAdmin.roles = [superAdminRole._id];
    existingSuperAdmin.isSuperAdmin = true;
    existingSuperAdmin.status = STATUS.ACTIVE;

    await existingSuperAdmin.save();

    console.log(`Super Admin already exists: ${env.superAdminEmail}`);
    return;
  }

  const hashedPassword = await hashPassword(env.superAdminPassword);

  await User.create({
    name: env.superAdminName,
    email: env.superAdminEmail.toLowerCase(),
    password: hashedPassword,
    roles: [superAdminRole._id],
    isSuperAdmin: true,
    status: STATUS.ACTIVE,
  });

  console.log(`Super Admin created: ${env.superAdminEmail}`);
};