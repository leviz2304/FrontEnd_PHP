// controllers/storeManagementProductController.js
import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import storeModel from "../models/storeModel.js";
import jwt from "jsonwebtoken";

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, colors, popular } = req.body;
    const { token } = req.headers;

    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];
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

    const store = await storeModel.findOne({ ownerId: userId, status: "approved" });
    if (!store) {
      return res.json({ success: false, message: "User doesn't have an approved store" });
    }

    let colorsData = [];
    if (colors) {  
        try {
            colorsData = typeof colors === "string" ? JSON.parse(colors) : colors;
        } catch (e) {
             colorsData = colors.split(",").map((c) => c.trim());
        }

      colorsData = colorsData.map(color => color.replace(/['"]+/g, ''));
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

export const updateProduct = async (req, res) => {
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
    const product = await productModel.findOne({ _id: productId, storeId: store._id });
    if (!product) {
      return res.json({ success: false, message: "Sản phẩm không tồn tại hoặc không thuộc store của bạn" });
    }
    const { name, description, price, category, popular, colors } = req.body;
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (popular !== undefined) product.popular = popular;

    if (colors) {
      let colorsData = [];
      try {
        colorsData = typeof colors === "string" ? JSON.parse(colors) : colors;
      } catch (e) {
        colorsData = colors.split(",").map((c) => c.trim());
      }
      product.colors = colorsData.map(color => color.replace(/['"]+/g, ''));;
    }
    
    await product.save();
    res.json({ success: true, message: "Cập nhật sản phẩm thành công", product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

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
    export const deleteProduct = async (req, res) => {
      try {
        const { productId } = req.params;
        const { token } = req.headers;
        if (!token) return res.json({ success: false, message: "Không có token" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const store = await storeModel.findOne({ ownerId: userId });
        if (!store) {
          return res.json({ success: false, message: "Store not found" });
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
      export const getStoreInfoForUser = async (req, res) => {
        try {
          const { token } = req.headers;
          if (!token) {
            return res.json({ success: false, message: "No token provided" });
          }
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const userId = decoded.id;
          const store = await storeModel.findOne({ ownerId: userId });
          return res.json({ success: true, store: store || null });
        } catch (error) {
          console.error(error);
          return res.json({ success: false, message: error.message });
        }
      };