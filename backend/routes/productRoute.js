import express from "express";
import {
    addProduct,
    updateProduct,
    deleteProduct,
    listStoreOwnerProducts,
    listAllProducts,
    getProductById
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import storeAuth from "../middleware/storeAuth.js"; 

const productRouter = express.Router();

productRouter.get("/list", listAllProducts);      
productRouter.get("/:productId", getProductById); 

productRouter.post(
    "/add",
    storeAuth, 
    upload.fields([ 
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
        { name: 'image4', maxCount: 1 }
    ]),
    addProduct
);

productRouter.put(
    "/:productId",
    storeAuth, 
    updateProduct 
);

productRouter.delete(
    "/:productId",
    storeAuth, 
    deleteProduct 
);

productRouter.get("/my-store/list", storeAuth, listStoreOwnerProducts);


export default productRouter;