import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
// import orderRouter from "./routes/orderRoute.js"
import seedAdmin from "./seedAdmin.js";

import followerModel from "./models/followerModel.js";
import messageModel from "./models/messageModel.js";
import orderModel from "./models/orderModel.js";
import productModel from "./models/productModel.js";
import roleModel from "./models/roleModel.js";
import storeModel from "./models/storeModel.js";
import storeNotificationModel from "./models/storeNotificationModel.js";
import userModel from "./models/userModel.js";
import userNotificationModel from "./models/userNotificationModel.js";
import storeRouter from "./routes/storeRoute.js";
import storeManagementRouter from "./routes/storeManagementRoute.js";
import storeManagementProductRoute from "./routes/storeManagementProductRoute.js";

// App Config
const app = express();
const port = process.env.PORT || 4000;

connectDB().then(() => {
  seedAdmin();

  // Create collections for all models so they appear in MongoDB
  Promise.all([
    followerModel.createCollection(),
    messageModel.createCollection(),
    orderModel.createCollection(),
    productModel.createCollection(),
    roleModel.createCollection(),
    storeModel.createCollection(),
    storeNotificationModel.createCollection(),
    userModel.createCollection(),
    userNotificationModel.createCollection(),
  ])
    .then(() => {
      console.log("✔ All collections are created (if they didn't already exist).");
    })
    .catch((err) => {
      console.error("❌ Error creating collections:", err);
    });
});

connectCloudinary();

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
// app.use("/api/order", orderRouter)
app.use("/api/store", storeRouter);
app.use("/api/store-management", storeManagementRouter);
app.use("/api/store-management", storeManagementProductRoute);

app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, () => console.log("Server is running on PORT : " + port));
