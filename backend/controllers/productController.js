import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import storeModel from "../models/storeModel.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose"; // Import mongoose để dùng ObjectId

// --- HELPER: Xử lý và làm sạch màu sắc ---
const cleanAndParseColors = (colorsInput) => {
    let colorsData = [];
    if (colorsInput) {
        try {
            // Thử parse JSON trước
            let parsed = typeof colorsInput === 'string' ? JSON.parse(colorsInput) : colorsInput;
            // Đảm bảo kết quả là mảng
            if (Array.isArray(parsed)) {
                colorsData = parsed.map(c => typeof c === 'string' ? c.replace(/['"]+/g, '').trim() : c)
                                   .filter(Boolean); // Lọc bỏ chuỗi rỗng sau khi trim
            } else if (typeof parsed === 'string') { // Nếu parse ra vẫn là chuỗi
                 colorsData = parsed.split(",").map(c => c.trim().replace(/['"]+/g, '')).filter(Boolean);
            }
        } catch (e) {
            // Nếu parse lỗi, coi như chuỗi ngăn cách bởi dấu phẩy
            if (typeof colorsInput === 'string') {
                colorsData = colorsInput.split(",").map(c => c.trim().replace(/['"]+/g, '')).filter(Boolean);
            }
        }
    }
    return colorsData;
};

// --- HELPER: Upload ảnh lên Cloudinary ---
const uploadImages = async (files) => {
    const image1 = files?.image1?.[0];
    const image2 = files?.image2?.[0];
    const image3 = files?.image3?.[0];
    const image4 = files?.image4?.[0];
    const imagesToUpload = [image1, image2, image3, image4].filter(Boolean); // Lọc bỏ undefined/null

    if (imagesToUpload.length === 0) {
        // Quyết định trả về lỗi hay dùng ảnh mặc định
        // return ["https://via.placeholder.com/150"]; // Hoặc throw lỗi
         throw new Error("At least one image is required.");
    }

    const uploadPromises = imagesToUpload.map(async (item) => {
        try {
            const result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
             // Optional: Xóa file tạm sau khi upload thành công nếu dùng diskStorage của multer
             // import fs from 'fs';
             // fs.unlinkSync(item.path);
            return result.secure_url;
        } catch (uploadError) {
             // Optional: Xóa file tạm nếu upload lỗi
             // if (item && item.path) { try { fs.unlinkSync(item.path); } catch(e){} }
             console.error("Cloudinary upload error:", uploadError);
             throw new Error(`Failed to upload image: ${item.originalname}`); // Ném lỗi cụ thể hơn
        }
    });

    return await Promise.all(uploadPromises);
};


// --- Store Owner: Thêm sản phẩm ---
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, colors, popular } = req.body;
        const { token } = req.headers; // Lấy token từ header (đã qua storeAuth)
        const store = req.store; // Lấy store từ middleware storeAuth

        if (!store) {
             // Dòng này không nên xảy ra nếu storeAuth hoạt động đúng
             return res.status(403).json({ success: false, message: "Store authentication failed." });
        }

        // Upload ảnh
        const imagesUrl = await uploadImages(req.files);

        // Làm sạch màu sắc
        const colorsData = cleanAndParseColors(colors);

         // Validate Price (phải là số dương)
        const numericPrice = Number(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({ success: false, message: "Invalid product price." });
        }

        const productData = {
            storeId: store._id, // Lấy _id từ store object
            name,
            description,
            price: numericPrice,
            category,
            popular: popular === "true" || popular === true, // Chuyển đổi boolean
            colors: colorsData,
            image: imagesUrl,
            // date được tự động thêm bởi Mongoose hoặc default
        };

        const product = new productModel(productData);
        await product.save();

        res.status(201).json({ success: true, message: "Product Added", product }); // Status 201 Created
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

// --- Store Owner: Cập nhật sản phẩm ---
const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { token } = req.headers;
        const store = req.store; // Lấy store từ middleware storeAuth
        const { storeId, date, ...updateData } = req.body; // Loại bỏ storeId, date khỏi dữ liệu cập nhật

        if (!store) {
             return res.status(403).json({ success: false, message: "Store authentication failed." });
        }
         if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid Product ID format." });
        }

        // Tìm sản phẩm VÀ đảm bảo nó thuộc cửa hàng của user này
        const product = await productModel.findOne({ _id: productId, storeId: store._id });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found or you don't have permission to edit it." });
        }

        // Xử lý và làm sạch màu sắc nếu có trong updateData
        if (updateData.colors !== undefined) {
             updateData.colors = cleanAndParseColors(updateData.colors);
        }

         // Validate và chuyển đổi Price nếu có
         if (updateData.price !== undefined) {
            const numericPrice = Number(updateData.price);
            if (isNaN(numericPrice) || numericPrice <= 0) {
                 return res.status(400).json({ success: false, message: "Invalid product price." });
            }
            updateData.price = numericPrice;
         }

         // Chuyển đổi popular nếu có
         if (updateData.popular !== undefined) {
             updateData.popular = updateData.popular === 'true' || updateData.popular === true;
         }

         // TODO: Xử lý cập nhật ảnh (phức tạp hơn: xóa ảnh cũ trên cloudinary, upload ảnh mới)

        // Cập nhật các trường
        Object.assign(product, updateData); // Gán các thuộc tính từ updateData vào product

        await product.save(); // Lưu lại thay đổi

        res.json({ success: true, message: "Product updated successfully", product });

    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to update product." });
    }
};

// --- Store Owner: Xóa sản phẩm ---
const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params; // Lấy productId từ params
        const { token } = req.headers;
        const store = req.store; // Lấy store từ middleware

        if (!store) {
             return res.status(403).json({ success: false, message: "Store authentication failed." });
        }
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid Product ID format." });
        }

        // Tìm và xóa sản phẩm ĐỒNG THỜI kiểm tra quyền sở hữu
        const deletedProduct = await productModel.findOneAndDelete({ _id: productId, storeId: store._id });

        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: "Product not found or you don't have permission to delete it." });
        }

        // TODO: Xóa các ảnh liên quan trên Cloudinary dựa vào deletedProduct.image

        res.json({ success: true, message: "Product deleted successfully." });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to delete product." });
    }
};

// --- Store Owner: Lấy danh sách sản phẩm của cửa hàng mình ---
const listStoreOwnerProducts = async (req, res) => {
     try {
        const store = req.store; // Lấy từ storeAuth middleware
         if (!store) {
             return res.status(403).json({ success: false, message: "Store authentication failed." });
        }
        // Thêm logic phân trang nếu cần
         const { page = 1, limit = 10 } = req.query;
         const pageNum = parseInt(page, 10);
         const limitNum = parseInt(limit, 10);
         const skip = (pageNum - 1) * limitNum;


        const products = await productModel.find({ storeId: store._id })
                                     .sort({ date: -1 }) // Sắp xếp mới nhất trước
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

// --- Public: Lấy danh sách TẤT CẢ sản phẩm (cho trang Collection/Home) ---
const listAllProducts = async (req, res) => {
    try {
         // Thêm logic phân trang, lọc, tìm kiếm nếu cần cho trang public
        const products = await productModel.find({})
                                     .populate('storeId', 'storeName storeLogo') // Lấy thêm logo store
                                     .sort({ date: -1 }); // Hoặc sắp xếp theo tiêu chí khác
        res.json({ success: true, products });
    } catch (error) {
        console.error("Error listing all products:", error);
        res.status(500).json({ success: false, message: "Failed to fetch products." });
    }
};

// --- Public: Lấy chi tiết một sản phẩm ---
const getProductById = async (req, res) => {
    try {
        const { productId } = req.params; // Lấy từ URL param
         if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid Product ID format." });
        }

        const product = await productModel.findById(productId)
                                      .populate('storeId', 'storeName storeLogo storeAddress'); // Lấy nhiều thông tin store hơn
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
    listStoreOwnerProducts, // Cho trang "My Store"
    listAllProducts,      // Cho trang public như Collection, Home
    getProductById        // Cho trang chi tiết sản phẩm public
};