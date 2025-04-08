import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import storeModel from "../models/storeModel.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose"; 
const cleanAndParseColors = (colorsInput) => {
    let colorsData = [];
    if (colorsInput) {
        try {
            let parsed = typeof colorsInput === 'string' ? JSON.parse(colorsInput) : colorsInput;
            if (Array.isArray(parsed)) {
                colorsData = parsed.map(c => typeof c === 'string' ? c.replace(/['"]+/g, '').trim() : c)
                                   .filter(Boolean); 
            } else if (typeof parsed === 'string') { 
                 colorsData = parsed.split(",").map(c => c.trim().replace(/['"]+/g, '')).filter(Boolean);
            }
        } catch (e) {
            if (typeof colorsInput === 'string') {
                colorsData = colorsInput.split(",").map(c => c.trim().replace(/['"]+/g, '')).filter(Boolean);
            }
        }
    }
    return colorsData;
};
const uploadImages = async (files) => {
    const image1 = files?.image1?.[0];
    const image2 = files?.image2?.[0];
    const image3 = files?.image3?.[0];
    const image4 = files?.image4?.[0];
    const imagesToUpload = [image1, image2, image3, image4].filter(Boolean); 

    if (imagesToUpload.length === 0) {
        // Quyết định trả về lỗi hay dùng ảnh mặc định
        // return ["https://via.placeholder.com/150"]; // Hoặc throw lỗi
         throw new Error("At least one image is required.");
    }

    const uploadPromises = imagesToUpload.map(async (item) => {
        try {
            const result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
             // import fs from 'fs';
             // fs.unlinkSync(item.path);
            return result.secure_url;
        } catch (uploadError) {
             // if (item && item.path) { try { fs.unlinkSync(item.path); } catch(e){} }
             console.error("Cloudinary upload error:", uploadError);
             throw new Error(`Failed to upload image: ${item.originalname}`); // Ném lỗi cụ thể hơn
        }
    });

    return await Promise.all(uploadPromises);
};

const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, colors, popular } = req.body;
        const { token } = req.headers; 
        const store = req.store; 

        if (!store) {
             return res.status(403).json({ success: false, message: "Store authentication failed." });
        }
        const imagesUrl = await uploadImages(req.files);

        const colorsData = cleanAndParseColors(colors);

        const numericPrice = Number(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({ success: false, message: "Invalid product price." });
        }

        const productData = {
            storeId: store._id, 
            name,
            description,
            price: numericPrice,
            category,
            popular: popular === "true" || popular === true, 
            colors: colorsData,
            image: imagesUrl,
        };

        const product = new productModel(productData);
        await product.save();

        res.status(201).json({ success: true, message: "Product Added", product });
    } catch (error) {
        console.error("Error adding product:", error);
         // Phân loại lỗi
         if (error.message.includes("At least one image is required")) {
             return res.status(400).json({ success: false, message: error.message });
         }
         if (error.message.startsWith("Failed to upload image")) {
             return res.status(500).json({ success: false, message: error.message });
         }
        res.status(500).json({ success: false, message: error.message || "Failed to add product." });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { token } = req.headers;
        const store = req.store; 
        const { storeId, date, ...updateData } = req.body;

        if (!store) {
             return res.status(403).json({ success: false, message: "Store authentication failed." });
        }
         if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid Product ID format." });
        }
        const product = await productModel.findOne({ _id: productId, storeId: store._id });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found or you don't have permission to edit it." });
        }

        if (updateData.colors !== undefined) {
             updateData.colors = cleanAndParseColors(updateData.colors);
        }
         if (updateData.price !== undefined) {
            const numericPrice = Number(updateData.price);
            if (isNaN(numericPrice) || numericPrice <= 0) {
                 return res.status(400).json({ success: false, message: "Invalid product price." });
            }
            updateData.price = numericPrice;
         }
         if (updateData.popular !== undefined) {
             updateData.popular = updateData.popular === 'true' || updateData.popular === true;
         }

        Object.assign(product, updateData); 

        await product.save(); 

        res.json({ success: true, message: "Product updated successfully", product });

    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to update product." });
    }
};
const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { token } = req.headers;
        const store = req.store; 

        if (!store) {
             return res.status(403).json({ success: false, message: "Store authentication failed." });
        }
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid Product ID format." });
        }
        const deletedProduct = await productModel.findOneAndDelete({ _id: productId, storeId: store._id });

        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: "Product not found or you don't have permission to delete it." });
        }
        res.json({ success: true, message: "Product deleted successfully." });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to delete product." });
    }
};

const listStoreOwnerProducts = async (req, res) => {
     try {
        const store = req.store; 
         if (!store) {
             return res.status(403).json({ success: false, message: "Store authentication failed." });
        }
         const { page = 1, limit = 10 } = req.query;
         const pageNum = parseInt(page, 10);
         const limitNum = parseInt(limit, 10);
         const skip = (pageNum - 1) * limitNum;


        const products = await productModel.find({ storeId: store._id })
                                     .sort({ date: -1 }) 
                                     .skip(skip)
                                     .limit(limitNum);

        const totalProducts = await productModel.countDocuments({ storeId: store._id });

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
        console.error("Error fetching store owner products:", error);
        res.status(500).json({ success: false, message: "Failed to fetch products." });
    }
};
const listAllProducts = async (req, res) => {
    try {
        const products = await productModel.find({})
                                     .populate('storeId', 'storeName storeLogo') 
                                     .sort({ date: -1 });
        res.json({ success: true, products });
    } catch (error) {
        console.error("Error listing all products:", error);
        res.status(500).json({ success: false, message: "Failed to fetch products." });
    }
};
const getProductById = async (req, res) => {
    try {
        const { productId } = req.params; 
         if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid Product ID format." });
        }

        const product = await productModel.findById(productId)
                                      .populate('storeId', 'storeName storeLogo storeAddress'); 
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }
        res.json({ success: true, product });
    } catch (error) {
        console.error("Error getting product by ID:", error);
        res.status(500).json({ success: false, message: "Failed to fetch product." });
    }
};


export {
    addProduct,
    updateProduct,
    deleteProduct,
    listStoreOwnerProducts, 
    listAllProducts,    
    getProductById     
};