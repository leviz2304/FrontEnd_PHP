import userModel from "../models/userModel.js";
import roleModel from "../models/roleModel.js"; 
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import followerModel from "../models/followerModel.js";
import storeModel from "../models/storeModel.js";
import { v2 as cloudinary } from "cloudinary";

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};
export const updateUserAvatar = async (req, res) => {
  try {
      const { token } = req.headers; 

      if (!token) {
           return res.status(401).json({ success: false, message: "Not authorized, no token" });
      }

      if (!req.file) {
          return res.status(400).json({ success: false, message: "No avatar file uploaded." });
      }

      let userId;
      try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.id;
      } catch (error) {
           console.error("Token verification failed:", error);
           return res.status(401).json({ success: false, message: "Not authorized, token failed" });
      }

      const user = await userModel.findById(userId);
      if (!user) {
          return res.status(404).json({ success: false, message: "User not found." });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "user_avatars",
          public_id: `avatar_${userId}`, 
          overwrite: true,
          resource_type: "image"
      });

      
      user.image = result.secure_url;
      await user.save();

      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({ success: true, message: "Avatar updated successfully.", user: userResponse });

  } catch (error) {
      console.error("Error uploading avatar:", error);
      // if (req.file && req.file.path)
      //  { try { fs.unlinkSync(req.file.path); } catch (e) { console.error("Error deleting temp file on error:", e); } }
      res.status(500).json({ success: false, message: "Failed to upload avatar." });
  }
};
export const updateUserProfile = async (req, res) => {
  try {
      const userId = req.body.userId; 
      const { name, phone, address } = req.body; 

      const user = await userModel.findById(userId);
      if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
      }

      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (address) user.address = address;

      const updatedUser = await user.save();
      const userResponse = updatedUser.toObject();
      delete userResponse.password;

      res.json({ success: true, message: "Profile updated successfully", user: userResponse });

  } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};
export const getUserInfo = async (req, res) => {
  try {
    const userId = req.body.userId;

    const user = await userModel.findById(userId)
                                .select("-password")
                                .populate('roleId', 'roleName');

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

     res.status(200).json({ success: true, user });

  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ success: false, message: "Server error getting user info" });
  }
};
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
        let userRole = await roleModel.findOne({ roleName: "user" });
        if (!userRole) {
            userRole = await roleModel.create({ roleName: "user" });
        }

        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword,
            roleId: userRole._id, 
        });

        const user = await newUser.save();
        const token = createToken(user._id);
        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

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
      
      const role = await roleModel.findById(adminUser.roleId);
      const approvedStore = await storeModel.findOne({ ownerId: adminUser._id, status: "approved" });
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
