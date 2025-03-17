import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import Footer from "../components/Footer";

const StoreOrders = () => {
  const { backendUrl, token,storeInfo  } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);

  const fetchStoreOrders = async () => {
    try {
        if (!storeInfo || !storeInfo._id) {
            console.error("Store info not available");
            return;
          }
          const response = await axios.get(
            `${backendUrl}/api/store-management/storeorders?storeId=${storeInfo._id}`,
            { headers: { token } }
          );
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (token) fetchStoreOrders();
  }, [token]);

  return (
    <div className="max-padd-container py-10">
      <Title title1="Store" title2="Orders" titleStyles="text-2xl font-bold text-center" />
      {orders.length > 0 ? (
        orders.map((order) => (
          <div key={order._id} className="bg-white p-4 rounded shadow my-4">
            <p>
              <strong>Order ID:</strong> {order._id}
            </p>
            <p>
              <strong>User:</strong> {order.userId}
            </p>
            <p>
              <strong>Amount:</strong> {order.amount}
            </p>
            <p>
              <strong>Status:</strong> {order.status}
            </p>
            <p>
              <strong>Payment Method:</strong> {order.paymentMethod}
            </p>
            <p>
              <strong>Date:</strong> {new Date(order.date).toLocaleString()}
            </p>
          </div>
        ))
      ) : (
        <p className="text-center">No orders found.</p>
      )}
      <Footer />
    </div>
  );
};

export default StoreOrders;
