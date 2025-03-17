import express from "express";
import { placeOrder, placeOrderVNPAY } from "../controllers/orderController.js";
import authUser from "../middleware/auth.js";
import storeAuth from "../middleware/storeAuth.js";
import { getOrderByStoreId } from "../controllers/storeManagementController.js";
import { getOrderByUserId } from "../controllers/orderController.js";
const orderRouter = express.Router();
orderRouter.get("/storeorder",authUser,getOrderByStoreId)
orderRouter.post("/place", authUser, placeOrder);
orderRouter.get("/userorder",authUser,getOrderByUserId)

orderRouter.post("/vnpay", authUser, placeOrderVNPAY);

export default orderRouter;
