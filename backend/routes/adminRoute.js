// backend/routes/adminRoute.js
import express from "express";
import adminAuth from "../middleware/adminAuth.js"; 
import {
    getDashboardStats,
    getAllStores,
    adminGetAllProducts,
    adminUpdateProduct,
    adminDeleteProduct,
    getAllReviews,
    adminDeleteReview,
    getAllUsers
} from "../controllers/adminController.js";
import { approveStore } from "../controllers/storeController.js"; 

const adminRouter = express.Router();

adminRouter.use(adminAuth); 

adminRouter.get("/stats", getDashboardStats);

adminRouter.get("/stores", getAllStores);

adminRouter.post("/stores/approve", approveStore);

adminRouter.get("/products", adminGetAllProducts);
adminRouter.put("/product/:productId", adminUpdateProduct);
adminRouter.delete("/product/:productId", adminDeleteProduct);

adminRouter.get("/reviews", getAllReviews);
adminRouter.delete("/review/:reviewId", adminDeleteReview);

adminRouter.get("/users", getAllUsers);

export default adminRouter;