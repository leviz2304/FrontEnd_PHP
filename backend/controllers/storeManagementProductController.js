import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import storeModel from "../models/storeModel.js";
import jwt from "jsonwebtoken";
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, colors, popular } = req.body;
    const { token } = req.headers;
    
    // Retrieve uploaded files
    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];
    // Filter out any falsy values (null, undefined, etc.)
    const images = [image1, image2, image3, image4].filter((item) => item);
    let imagesUrl;
    if (images.length > 0) {
      imagesUrl = await Promise.all(
        images.map(async (item) => {
          const result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
          return result.secure_url;
        })
      );
    } else {
      return res.json({ success: false, message: "cannot upload" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    
    // Find the store for the user that is approved
    const store = await storeModel.findOne({ ownerId: userId, status: "approved" });
    if (!store) {
      return res.json({ success: false, message: "User doesn't have an approved store" });
    }
    
    // Process the colors field: if received as a JSON string then parse it, otherwise split by comma
    let colorsData = [];
    try {
      colorsData = typeof colors === "string" ? JSON.parse(colors) : colors;
    } catch (e) {
      colorsData = colors.split(",").map((c) => c.trim());
    }
    
    const productData = {
      storeId: store._id,
      name,
      description,
      price,
      category,
      popular: popular === "true" || popular === true,
      colors: colorsData,
      image: imagesUrl,
      date: Date.now(),
    };
    
    const product = new productModel(productData);
    await product.save();
    
    res.json({ success: true, message: "Product Added", product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Lấy danh sách sản phẩm của store (CRUD Read)
export const listProducts = async (req, res) => {
  try {
    const { token } = req.headers;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const store = await storeModel.findOne({ ownerId: userId });
    if (!store) {
      return res.json({ success: false, message: "Store not found" });
    }
    const products = await productModel.find({ storeId: store._id });
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Cập nhật sản phẩm (CRUD Update)
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { token } = req.headers;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const store = await storeModel.findOne({ ownerId: userId });
    if (!store) {
      return res.json({ success: false, message: "Store not found" });
    }
    // Kiểm tra sản phẩm thuộc store của người dùng
    const product = await productModel.findOne({ _id: productId, storeId: store._id });
    if (!product) {
      return res.json({ success: false, message: "Product not found or doesn't belong to your store" });
    }
    const { name, description, price, category, popular, colors } = req.body;
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (popular !== undefined) product.popular = popular;
    
    // Xử lý colors: nếu là chuỗi thì chuyển thành mảng
    if (colors) {
      let colorsData = [];
      try {
        colorsData = typeof colors === "string" ? JSON.parse(colors) : colors;
      } catch (e) {
        colorsData = colors.split(",").map(c => c.trim());
      }
      product.colors = colorsData;
    }
    
    await product.save();
    res.json({ success: true, message: "Product updated successfully", product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Xoá sản phẩm (CRUD Delete)
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { token } = req.headers;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const store = await storeModel.findOne({ ownerId: userId });
    if (!store) {
      return res.json({ success: false, message: "Store not found" });
    }
    const product = await productModel.findOneAndDelete({ _id: productId, storeId: store._id });
    if (!product) {
      return res.json({ success: false, message: "Product not found or doesn't belong to your store" });
    }
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
