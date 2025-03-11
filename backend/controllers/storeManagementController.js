import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import storeModel from "../models/storeModel.js";
import productModel from "../models/productModel.js";

// Hàm cập nhật thông tin store (tên, địa chỉ)
export const updateStoreInfo = async (req, res) => {
  try {
    const { storeName, storeAddress } = req.body;
    const { token } = req.headers;
    if (!token) {
      return res.json({ success: false, message: "Không có token, vui lòng đăng nhập lại" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const store = await storeModel.findOne({ ownerId: userId });
    if (!store) {
      return res.json({ success: false, message: "Store không tồn tại" });
    }
    if (storeName) store.storeName = storeName;
    if (storeAddress) store.storeAddress = storeAddress;
    await store.save();
    res.json({ success: true, message: "Cập nhật thông tin store thành công", store });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Hàm cập nhật avatar (storeLogo) cho store
export const updateStoreAvatar = async (req, res) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({ success: false, message: "Không có token, vui lòng đăng nhập lại" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const store = await storeModel.findOne({ ownerId: userId });
    if (!store) {
      return res.json({ success: false, message: "Store không tồn tại" });
    }
    // Kiểm tra file đã được upload từ middleware multer (req.file)
    if (!req.file) {
      return res.json({ success: false, message: "Chưa upload file avatar" });
    }
    const result = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
    store.storeLogo = result.secure_url;
    await store.save();
    res.json({ success: true, message: "Cập nhật avatar thành công", storeLogo: store.storeLogo });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Hàm lấy danh sách sản phẩm của store hiện tại (dựa theo ownerId)
export const getStoreProducts = async (req, res) => {
  try {
    const { token } = req.headers;
    if (!token) return res.json({ success: false, message: "Không có token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const store = await storeModel.findOne({ ownerId: userId });
    if (!store) {
      return res.json({ success: false, message: "Store không tồn tại" });
    }
    const products = await productModel.find({ storeId: store._id });
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Hàm cập nhật sản phẩm của store
export const updateStoreProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { token } = req.headers;
    if (!token) return res.json({ success: false, message: "Không có token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const store = await storeModel.findOne({ ownerId: userId });
    if (!store) {
      return res.json({ success: false, message: "Store không tồn tại" });
    }
    // Kiểm tra sản phẩm thuộc store này
    const product = await productModel.findOne({ _id: productId, storeId: store._id });
    if (!product) {
      return res.json({ success: false, message: "Sản phẩm không tồn tại hoặc không thuộc store của bạn" });
    }
    // Lấy các trường cần cập nhật từ body
    const { name, description, price, category, popular, colors } = req.body;
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (popular !== undefined) product.popular = popular;
    if (colors) product.colors = colors;
    await product.save();
    res.json({ success: true, message: "Cập nhật sản phẩm thành công", product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const deleteStoreProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { token } = req.headers;
    if (!token) return res.json({ success: false, message: "Không có token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const store = await storeModel.findOne({ ownerId: userId });
    if (!store) {
      return res.json({ success: false, message: "Store không tồn tại" });
    }
    const product = await productModel.findOneAndDelete({ _id: productId, storeId: store._id });
    if (!product) {
      return res.json({ success: false, message: "Sản phẩm không tồn tại hoặc không thuộc store của bạn" });
    }
    res.json({ success: true, message: "Xoá sản phẩm thành công" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
export const getMyStore = async (req, res) => {
    try {
      if (!req.store) {
        return res.json({ success: false, message: "Store not found" });
      }
      res.json({ success: true, store: req.store });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };