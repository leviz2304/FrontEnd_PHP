import userModel from "../models/userModel.js";
import storeModel from "../models/storeModel.js";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";
import reviewModel from "../models/reviewModel.js";

export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await userModel.countDocuments({});
        const totalStores = await storeModel.countDocuments({});
        const pendingStoresCount = await storeModel.countDocuments({ status: 'pending' });
        const approvedStoresCount = totalStores - pendingStoresCount;
        const totalProducts = await productModel.countDocuments({});
        const totalOrders = await orderModel.countDocuments({});

        const recentOrders = await orderModel.find({})
            .sort({ date: -1 }) 
            .limit(5)
            .populate('userId', 'name email') 
            .populate('storeId', 'storeName'); 

        const recentPendingStores = await storeModel.find({ status: 'pending' })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('ownerId', 'name email');

        res.json({
            success: true,
            stats: {
                users: totalUsers,
                stores: {
                    total: totalStores,
                    pending: pendingStoresCount,
                    approved: approvedStoresCount,
                },
                products: totalProducts,
                orders: totalOrders,
            },
            recentOrders,
            recentPendingStores
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ success: false, message: "Failed to fetch dashboard stats." });
    }
};

export const getAllStores = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (status) {
            filter.status = status; 
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const stores = await storeModel.find(filter)
            .populate('ownerId', 'name email') 
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const totalStores = await storeModel.countDocuments(filter);

        res.json({
             success: true,
             stores,
             pagination: {
                 currentPage: pageNum,
                 totalPages: Math.ceil(totalStores / limitNum),
                 totalStores,
                 limit: limitNum
             }
         });
    } catch (error) {
        console.error("Error fetching stores:", error);
        res.status(500).json({ success: false, message: "Failed to fetch stores." });
    }
};


export const adminGetAllProducts = async (req, res) => {
    try {
         const { storeId, category, page = 1, limit = 10, search = '' } = req.query;
        const filter = {};
        if (storeId) filter.storeId = storeId;
        if (category) filter.category = category;
         if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

         const pageNum = parseInt(page, 10);
         const limitNum = parseInt(limit, 10);
         const skip = (pageNum - 1) * limitNum;

        const products = await productModel.find(filter)
            .populate('storeId', 'storeName') 
            .sort({ date: -1 })
            .skip(skip)
            .limit(limitNum);

         const totalProducts = await productModel.countDocuments(filter);

        res.json({
            success: true,
            products,
            pagination: {
                 currentPage: pageNum,
                 totalPages: Math.ceil(totalProducts / limitNum),
                 totalProducts,
                 limit: limitNum
            }
        });
    } catch (error) {
        console.error("Error fetching all products:", error);
        res.status(500).json({ success: false, message: "Failed to fetch products." });
    }
};

export const adminUpdateProduct = async (req, res) => {
     try {
        const { productId } = req.params;
        const { storeId, ...updateData } = req.body;

         if (updateData.colors && typeof updateData.colors === 'string') {
            try {
                let parsedColors = JSON.parse(updateData.colors);
                if(Array.isArray(parsedColors)){
                    updateData.colors = parsedColors.map(c => typeof c === 'string' ? c.replace(/['"]+/g, '') : c).filter(Boolean);
                } else { 
                     updateData.colors = updateData.colors.split(',').map(c => c.trim().replace(/['"]+/g, '')).filter(Boolean);
                }
            } catch(e) { 
                 updateData.colors = updateData.colors.split(',').map(c => c.trim().replace(/['"]+/g, '')).filter(Boolean);
            }
        } else if (Array.isArray(updateData.colors)) {
             updateData.colors = updateData.colors.map(c => typeof c === 'string' ? c.replace(/['"]+/g, '') : c).filter(Boolean);
        }


        const updatedProduct = await productModel.findByIdAndUpdate(
            productId,
            { $set: updateData },
            { new: true, runValidators: true } 
        ).populate('storeId', 'storeName');

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        res.json({ success: true, message: "Product updated by admin.", product: updatedProduct });
    } catch (error) {
        console.error("Error updating product by admin:", error);
        res.status(500).json({ success: false, message: "Failed to update product." });
    }
};

export const adminDeleteProduct = async (req, res) => {
     try {
        const { productId } = req.params;
        const deletedProduct = await productModel.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }


        res.json({ success: true, message: "Product deleted by admin." });
    } catch (error) {
        console.error("Error deleting product by admin:", error);
        res.status(500).json({ success: false, message: "Failed to delete product." });
    }
};

export const getAllReviews = async (req, res) => {
     try {
         const { page = 1, limit = 10 } = req.query;
         const pageNum = parseInt(page, 10);
         const limitNum = parseInt(limit, 10);
         const skip = (pageNum - 1) * limitNum;

        const reviews = await reviewModel.find({})
            .populate('userId', 'name email image') 
            .populate({
                path: 'productId',
                select: 'name image storeId', 
                populate: {
                   path: 'storeId',
                   select: 'storeName'
                }
            })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limitNum);

         const totalReviews = await reviewModel.countDocuments({});

         res.json({
             success: true,
             reviews,
              pagination: {
                 currentPage: pageNum,
                 totalPages: Math.ceil(totalReviews / limitNum),
                 totalReviews,
                 limit: limitNum
             }
          });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ success: false, message: "Failed to fetch reviews." });
    }
};

export const adminDeleteReview = async (req, res) => {
     try {
        const { reviewId } = req.params;
        const deletedReview = await reviewModel.findByIdAndDelete(reviewId);

        if (!deletedReview) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }
        res.json({ success: true, message: "Review deleted by admin." });
    } catch (error) {
        console.error("Error deleting review by admin:", error);
        res.status(500).json({ success: false, message: "Failed to delete review." });
    }
};

export const getAllUsers = async (req, res) => {
     try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

         const filter = {};
         if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }


        const users = await userModel.find(filter)
            .select("-password") 
            .populate('roleId', 'roleName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

         const totalUsers = await userModel.countDocuments(filter);

         res.json({
             success: true,
             users,
              pagination: {
                 currentPage: pageNum,
                 totalPages: Math.ceil(totalUsers / limitNum),
                 totalUsers,
                 limit: limitNum
             }
         });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: "Failed to fetch users." });
    }
};