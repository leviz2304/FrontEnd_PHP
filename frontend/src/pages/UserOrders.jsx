import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import Footer from "../components/Footer";
import OrderDetail from "../components/OrderDetail";
import { toast } from "react-toastify";

const UserOrders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchUserOrders = async () => {
    try {
      if (!token) return;
      const response = await axios.get(`${backendUrl}/api/order/userorder`, {
        headers: { token },
      });
      if (response.data.success) {
        const fetchedOrders = response.data.orders.reverse();
        setOrders(fetchedOrders);
        if (fetchedOrders.length > 0) {
          setSelectedOrder(fetchedOrders[0]);
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserOrders();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-padd-container py-10">
        <Title
          title1="My"
          title2="Orders"
          titleStyles="text-2xl font-bold text-center mb-6"
        />
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar: Danh sách đơn hàng */}
          <div className="md:w-1/3">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-white p-4 rounded-lg shadow mb-4 cursor-pointer transition hover:shadow-xl ${
                    selectedOrder && selectedOrder._id === order._id
                      ? "border-2 border-primary"
                      : ""
                  }`}
                >
                  <p className="font-bold text-sm">Order ID: {order._id}</p>
                  <p className="text-xs">
                    Date: {new Date(order.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs">Status: {order.status}</p>
                  <p className="text-xs">
                    Amount: {currency}
                    {order.amount}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600">No orders found.</p>
            )}
          </div>
          {/* Main: Chi tiết đơn hàng */}
          <div className="md:w-2/3">
            {selectedOrder ? (
              <OrderDetail
                order={selectedOrder}
                backendUrl={backendUrl}
                token={token}
                currency={currency}
              />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p>Select an order to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserOrders;
