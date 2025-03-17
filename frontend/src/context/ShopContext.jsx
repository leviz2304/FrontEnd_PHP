import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [storeInfo, setStoreInfo] = useState(
    JSON.parse(localStorage.getItem("storeInfo")) || null 
  );
  const [token, setToken] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const currency = "$";
  const delivery_charges = 10;

  // Cập nhật thông tin store và lưu vào localStorage
  const updateStoreInfoContext = (data) => {
    setStoreInfo(data);
    localStorage.setItem("storeInfo", JSON.stringify(data));
  };

  // Hàm gọi API lấy thông tin store
  const getStoreInfo = async () => {
    try {
      if (token) {
        const response = await axios.get(
          `${backendUrl}/api/store/info`,
          { headers: { token } }
        );
        if (response.data.success) {
          updateStoreInfoContext(response.data.store);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error fetching store information"
      );
    }
  };
  

  // Gọi API lấy thông tin store mỗi khi token thay đổi
  useEffect(() => {
    if (token) {
      getStoreInfo();
    }
  }, [token]);

  // Auto logout sau 30 phút không hoạt động
  useEffect(() => {
    let timer;
    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setToken("");
        localStorage.removeItem("token");
        alert("Phiên làm việc của bạn đã hết. Vui lòng đăng nhập lại.");
        navigate("/login");
      }, 30 * 60 * 1000); // 30 phút
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keypress", resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keypress", resetTimer);
      clearTimeout(timer);
    };
  }, [navigate]);

  // Hàm thêm sản phẩm vào giỏ hàng
  const addToCart = async (itemId, color) => {
    if (!color) {
      toast.error("Please select the color first");
      return;
    }
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      if (cartData[itemId][color]) {
        cartData[itemId][color] += 1;
      } else {
        cartData[itemId][color] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][color] = 1;
    }
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, color },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  // GETTING TOTAL CART COUNT
  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalCount;
  };

  // UPDATING THE QUANTITY OF CART ITEMS
  const updateQuantity = async (itemId, color, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][color] = quantity;
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, color, quantity },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  // GETTING TOTAL CART AMOUNT
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
    return totalAmount;
  };

  // Lấy danh sách sản phẩm (chạy 1 lần khi component mount)
  const getProductData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Lấy giỏ hàng của người dùng
  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/cart/get",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Effect chạy một lần khi component mount để kiểm tra token và lấy dữ liệu
  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      const savedToken = localStorage.getItem("token");
      setToken(savedToken);
      getUserCart(savedToken);
    }
    getProductData();
  }, []); // chạy 1 lần khi component mount

  const value = {
    navigate,
    products,
    search,
    setSearch,
    currency,
    delivery_charges,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    token,
    setToken,
    backendUrl,
    storeInfo, // lưu thông tin cửa hàng bao gồm storeId
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
