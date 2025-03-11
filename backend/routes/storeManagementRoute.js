import express from "express";
import multer from "multer";
import {
  updateStoreInfo,
  updateStoreAvatar,
  getStoreProducts,
  updateStoreProduct,
  deleteStoreProduct,
  getMyStore

} from "../controllers/storeManagementController.js";
import storeAuth from "../middleware/storeAuth.js";  

const router = express.Router();

const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});
const upload = multer({ storage });

router.put("/update-info", storeAuth, updateStoreInfo);

router.put("/update-avatar", storeAuth, upload.single("avatar"), updateStoreAvatar);

router.get("/products", storeAuth, getStoreProducts);

router.put("/products/:productId", storeAuth, updateStoreProduct);
router.get("/my-store", storeAuth, getMyStore);

router.delete("/products/:productId", storeAuth, deleteStoreProduct);

export default router;
