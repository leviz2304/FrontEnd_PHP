import storeModel from "../models/storeModel.js";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const requestStore=async(req,res)=>{
    try{
        const {storeName,storeAddress}=req.body;
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
    }catch(error){
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