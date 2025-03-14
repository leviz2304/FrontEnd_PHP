import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js";
import storeModel from "../models/storeModel.js";
import jwt from "jsonwebtoken";
const addProduct = async (req, res) => {
    try {
      const { name, description, price, category, colors, popular } = req.body;
      const { token } = req.headers;
      const image1 = req.files?.image1?.[0];
      const image2 = req.files?.image2?.[0];
      const image3 = req.files?.image3?.[0];
      const image4 = req.files?.image4?.[0];
  
      const images = [image1, image2, image3, image4].filter((item) => item !== undefined);
      let imagesUrl;
      if (images.length > 0) {
        imagesUrl = await Promise.all(
          images.map(async (item) => {
            const result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
            return result.secure_url;
          })
        );
      } else {
        imagesUrl = ["https://via.placeholder.com/150"];
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
  
      // Find the store owned by the user that is approved
      const store = await storeModel.findOne({ ownerId: userId, status: "approved" });
      if (!store) {
        return res.json({ success: false, message: "User doesn't have an approved store" });
      }
  
      const productData = {
        storeId: store._id,
        name,
        description,
        price,
        category,
        popular: popular === "true" ? true : false,
        colors: colors ? JSON.parse(colors) : [],
        image: imagesUrl,
        date: Date.now(),
      };
  
      console.log(productData);
  
      const product = new productModel(productData);
      await product.save();
  
      res.json({ success: true, message: "Product Added" });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };

const removeProduct = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Product Removed" })
    } catch (error) {

        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({})
        res.json({ success: true, products })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }
}

const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({ success: true, product })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }
}

export { addProduct, removeProduct, listProducts, singleProduct }

