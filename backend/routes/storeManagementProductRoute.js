// src/routes/storeManagementProductRoute.js
import express from "express";
import multer from "multer";
import {
  createProduct,
  listProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/storeManagementProductController.js";
import storeAuth from "../middleware/storeAuth.js";

const router = express.Router();

const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});
const upload = multer({ storage });

router.post(
  "/products",
  storeAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  createProduct
);

router.get("/products", storeAuth, listProducts);

// Cập nhật sản phẩm (PUT)
router.put("/products/:productId", storeAuth, updateProduct);

// Xoá sản phẩm (DELETE)
router.delete("/products/:productId", storeAuth, deleteProduct);

export default router;
