import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Title from "../components/Title";

const OrderSuccess = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-100">
      <div className="max-w-lg bg-white p-6 rounded shadow-md">
        <Title 
          title1="Thanh toán" 
          title2="Thành công" 
          titleStyles="text-center text-2xl font-bold" 
        />
        <p className="text-center mt-4 text-lg text-green-700">
          Cảm ơn bạn đã thanh toán thành công. Đơn hàng của bạn đã được xác nhận.
        </p>
        <p className="text-center mt-2 text-gray-600">
          Bạn có thể theo dõi đơn hàng của mình tại trang "Đơn hàng".
        </p>
        <div className="mt-6 flex justify-center">
          <Link to="/" className="btn-secondary">
            Về trang chủ
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
