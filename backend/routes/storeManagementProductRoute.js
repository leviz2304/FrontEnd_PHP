// src/routes/storeManagementProductRoute.js
import express from "express";
import upload from "../middleware/multer.js";
import {
  createProduct,
  listProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/storeManagementProductController.js";
import storeAuth from "../middleware/storeAuth.js";

const router = express.Router();

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
router.put("/products/:productId", storeAuth, updateProduct);
router.delete("/products/:productId", storeAuth, deleteProduct);

export default router;
