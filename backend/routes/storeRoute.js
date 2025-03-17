// routes/storeRoute.js
import express from "express";
import { requestStore, getPendingStores, approveStore,getSingleStore,getStoreInfoForUser  } from "../controllers/storeController.js";
import authUser from "../middleware/auth.js";       // user phải đăng nhập
import adminAuth from "../middleware/adminAuth.js"; // admin mới được duyệt store

const storeRouter = express.Router();

// User gửi request mở store
storeRouter.post("/request", authUser, requestStore);

// Admin xem danh sách store pending
storeRouter.get("/pending", adminAuth, getPendingStores);
storeRouter.get("/info", authUser, getStoreInfoForUser);

// Admin phê duyệt store
storeRouter.post("/approve", adminAuth, approveStore);
storeRouter.get("/single", getSingleStore);

export default storeRouter;
