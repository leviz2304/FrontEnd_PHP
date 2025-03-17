import moment from "moment";
import queryString from "query-string";
import crypto from "crypto";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

const sortObject = (obj) => {
  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = obj[key];
    });
  return sorted;
};
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
export const getOrderByUserId=async(req,res)=>{
   
    try{
        const {userId}=req.body;
        const orders=await orderModel.find({userId});
        res.json({success:true,orders})
    }catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }
}

// Controller cho COD
export const placeOrder = async (req, res) => {
  try {
    const { userId, storeId, items, amount, address } = req.body;

    const orderData = {
      userId,
      storeId,
      items,
      amount,
      address,
      paymentMethod: "COD",
      payment: false, // COD chưa được thanh toán ngay lúc đặt hàng
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Xóa giỏ hàng trong DB sau khi đặt hàng thành công
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order placed successfully." });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Controller cho VNPAY
export const placeOrderVNPAY = async (req, res) => {
  try {
    const { userId, storeId, items, amount, address } = req.body;

    const orderData = {
      userId,
      storeId,
      items,
      amount,
      address,
      paymentMethod: "VNPAY",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    let vnp_Params = {
      vnp_Version: "2.0.0",
      vnp_Command: "pay",
      vnp_TmnCode: process.env.VNP_TMN_CODE,
      vnp_Amount: amount * 100, // Nếu theo yêu cầu là nhân 100, nếu không thì sửa lại
      vnp_CurrCode: "VND",
      vnp_TxnRef: newOrder._id.toString(), // Unique transaction reference (order ID)
      vnp_OrderInfo: `Payment for order ${newOrder._id}`,
      vnp_OrderType: "other",
      vnp_Locale: "vn",
      vnp_ReturnUrl: process.env.VNP_RETURN_URL, // Return URL sau khi thanh toán
      vnp_IpAddr: req.ip,
      vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
    };

    const sortedParams = sortObject(vnp_Params);
    const signData = queryString.stringify(sortedParams, { encode: false });
    const secureHash = crypto
      .createHmac("sha512", process.env.VNP_HASH_SECRET)
      .update(signData)
      .digest("hex");

    // Build the payment URL
    const vnpUrl =
      process.env.VNP_URL +
      "?" +
      queryString.stringify(sortedParams) +
      `&vnp_SecureHash=${secureHash}`;

    // Ở VNPAY, bạn thường không xóa giỏ hàng ngay vì cần chờ callback từ VNPAY xác nhận thanh toán.
    // Tuy nhiên, nếu bạn muốn xóa giỏ hàng ngay sau khi tạo đơn hàng, bạn có thể uncomment dòng bên dưới:
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    return res.json({ success: true, vnpUrl });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};
