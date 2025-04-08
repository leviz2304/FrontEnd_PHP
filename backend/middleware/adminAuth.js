import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import roleModel from "../models/roleModel.js";

const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({ success: false, message: "Not Authorized. Please login again." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
        const adminUser = await userModel.findById(userId);
    if (!adminUser) {
      return res.json({ success: false, message: "User not found." });
    }
    
    const role = await roleModel.findById(adminUser.roleId);
    if (!role || role.roleName !== "admin") {
      return res.json({ success: false, message: "Not Authorized. Admin only." });
    }
    
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default adminAuth;
