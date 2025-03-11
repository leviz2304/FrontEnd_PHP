// seedAdmin.js
import roleModel from "./models/roleModel.js";
import userModel from "./models/userModel.js";
import bcrypt from "bcrypt";

async function seedAdmin() {
  try {
    let adminRole = await roleModel.findOne({ roleName: "admin" });
    if (!adminRole) {
      adminRole = await roleModel.create({ roleName: "admin" });
      console.log("✔ Admin role created.");
    }

    // 2) Check or create the single admin user
    const adminEmail = process.env.ADMIN_EMAIL; // e.g. "admin@underdogs.com"
    const adminPass = process.env.ADMIN_PASS;   // e.g. "admin123"

    let adminUser = await userModel.findOne({ email: adminEmail });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPass, salt);

      adminUser = await userModel.create({
        name: "Administrator",
        email: adminEmail,
        password: hashedPassword,
        roleId: adminRole._id, // Link to the "admin" role
      });
      console.log("✔ Admin user created.");
    } else {
      console.log("Admin user already exists.");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error.message);
  }
}

export default seedAdmin;
