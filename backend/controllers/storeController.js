import storeModel from "../models/storeModel.js";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import productModel from "../models/productModel.js";
import followerModel from "../models/followerModel.js"; // IMPORT
import userNotificationModel from "../models/userNotificationModel.js"; // IMPORT


export const requestStore = async (req, res) => {
    try {
        const { storeName, storeAddress } = req.body;
        const { token } = req.headers;
        if (!token) {
            return res.json({ success: false, message: "Not Authorized. Please login again." });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const newStore = new storeModel({
            ownerId: userId,
            storeName,
            storeAddress,
            status: "pending",
        });
        await newStore.save();
        res.json({ success: true, message: "Store request sent successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export const getPendingStores = async (req, res) => {
    try {
        const pendingStores = await storeModel.find({ status: "pending" });
        res.json({ success: true, pendingStores });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export const approveStore = async (req, res) => {
    try {
        const { storeId } = req.body;
        const store = await storeModel.findById(storeId);
        if (!store) {
            return res.json({ success: false, message: "Store not found" });
        }
        // Cập nhật trạng thái thành "approved"
        store.status = "approved";
        await store.save();

        res.json({ success: true, message: "Store approved successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
export const getSingleStore = async (req, res) => {
    try {
        const { storeId } = req.query;
        if (!storeId) {
            return res.json({ success: false, message: "Store ID is required" });
        }
        const store = await storeModel.findById(storeId);
        if (!store) {
            return res.json({ success: false, message: "Store not found" });
        }
        res.json({ success: true, store });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
export const getStoreInfoForUser = async (req, res) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.json({ success: false, message: "No token provided" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        // Không bắt buộc trạng thái "approved"
        const store = await storeModel.findOne({ ownerId: userId }); // Use owner, not ownerId
        return res.json({ success: true, store: store || null });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};
export const getPublicStoreDetails = async (req, res) => {
    try {
        const { storeId } = req.params; 
        const store = await storeModel.findById(storeId).select("-owner -__v");

        if (!store) {
            return res.status(404).json({ success: false, message: "Store not found" });
        }

        const products = await productModel.find({ storeId: storeId }).select("-storeId -__v");

        res.json({ success: true, store, products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
export const followStore = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { userId } = req.body; 
        const existingFollow = await followerModel.findOne({ userId, storeId });
        if (existingFollow) {
            return res.status(400).json({ success: false, message: "Already following this store" });
        }

        const newFollow = new followerModel({ userId, storeId });
        await newFollow.save();

        const newNotification = new userNotificationModel({
            userId: storeId, 
            message: `User ${userId} is now following your store!`,
        });
        await newNotification.save();

        res.json({ success: true, message: "Successfully followed the store" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const unfollowStore = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { userId } = req.body; 

        const result = await followerModel.deleteOne({ userId, storeId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Not following this store" });
        }

          const deletedNotification = await userNotificationModel.deleteOne({userId: storeId, message: `User ${userId} is now following your store!`})

        res.json({ success: true, message: "Successfully unfollowed the store" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const isFollowingStore = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { userId } = req.body; 

        const follow = await followerModel.findOne({ userId, storeId });
        const isFollowing = !!follow;

        res.json({ success: true, isFollowing });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error checking follow status' });
    }
};