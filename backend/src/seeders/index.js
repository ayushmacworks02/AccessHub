import { connectDB, disconnectDB } from "../config/db.js";
import { seedPermissions } from "./seed-permissions.js";
import { seedSuperAdmin } from "./seed-super-admin.js";

const runSeeders = async () => {
  try {
    await connectDB();

    await seedPermissions();
    await seedSuperAdmin();

    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
    process.exit();
  }
};

runSeeders();