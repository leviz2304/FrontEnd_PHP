import userModel from "../models/userModel.js";
import roleModel from "../models/roleModel.js"; // Import the Role model
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import storeModel from "../models/storeModel.js";
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Regular user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = createToken(user._id);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid Credentials" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Regular user registration; always assigns the "user" role
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" });
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Look up the "user" role. Create it if it doesn't exist.
        let userRole = await roleModel.findOne({ roleName: "user" });
        if (!userRole) {
            userRole = await roleModel.create({ roleName: "user" });
        }

        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword,
            roleId: userRole._id, // assign the "user" role
        });

        const user = await newUser.save();
        const token = createToken(user._id);
        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Admin login: verifies that the account exists, password matches, and the role is "admin"
const adminLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      const adminUser = await userModel.findOne({ email });
      if (!adminUser) {
        return res.json({ success: false, message: "Admin not found" });
      }
      const isMatch = await bcrypt.compare(password, adminUser.password);
      if (!isMatch) {
        return res.json({ success: false, message: "Invalid Credentials" });
      }
      
      // Verify the user's role from the Role collection
      const role = await roleModel.findById(adminUser.roleId);
      // Also, check if the user owns an approved store
      const approvedStore = await storeModel.findOne({ ownerId: adminUser._id, status: "approved" });
      
      // Allow login if either the role is admin OR if the user has an approved store
      if (role.roleName !== "admin" && !approvedStore) {
        return res.json({ success: false, message: "Not an admin account or approved store owner" });
      }
      
      const token = createToken(adminUser._id);
      res.json({ success: true, token });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };

export { loginUser, registerUser, adminLogin };
