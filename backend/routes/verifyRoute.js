import express from "express";
import crypto from "crypto";
import queryString from "query-string";
import orderModel from "../models/orderModel.js";

const router = express.Router();

const sortObject = (obj) => {
  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = obj[key];
    });
  return sorted;
};

router.get("/verify", async (req, res) => {
  try {
    const vnp_Params = req.query;
    const secureHash = vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHash;
    const sortedParams = sortObject(vnp_Params);
    const signData = queryString.stringify(sortedParams, { encode: false });

      
    const FE_URL = process.env.FE_URL || "http://localhost:5173";
    
      const orderId = vnp_Params.vnp_TxnRef; 
      const responseCode = vnp_Params.vnp_ResponseCode;

      if (responseCode === "00") {
        await orderModel.findByIdAndUpdate(orderId, {
          payment: true,
          status: "Paid",
        });
        return res.redirect(`${FE_URL}/order-success`);
      } else {
        await orderModel.findByIdAndUpdate(orderId, {
          payment: false,
          status: "Payment Failed",
        });
        return res.redirect(`${FE_URL}/order-failed`);
      }
    
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error.");
  }
});

export default router;
