// backend/routes/storeRoute.js
import express from "express";
import {
  requestStore,
  getPendingStores,
  approveStore,
  getSingleStore,
  getStoreInfoForUser,
  getPublicStoreDetails,
  followStore,
  unfollowStore,
  isFollowingStore
} from "../controllers/storeController.js";
import authUser from "../middleware/auth.js"; 
import adminAuth from "../middleware/adminAuth.js";

const storeRouter = express.Router();

storeRouter.get("/public/:storeId", getPublicStoreDetails);

storeRouter.post("/follow/:storeId", authUser, followStore);
storeRouter.post("/unfollow/:storeId", authUser, unfollowStore);
storeRouter.post("/isfollowing/:storeId", authUser, isFollowingStore); 

storeRouter.post("/request", authUser, requestStore);

storeRouter.get("/pending", adminAuth, getPendingStores);
storeRouter.post("/approve", adminAuth, approveStore);

storeRouter.get("/info", authUser, getStoreInfoForUser);

storeRouter.get("/single", getSingleStore); 

export default storeRouter;