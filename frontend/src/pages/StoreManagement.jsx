// src/pages/StoreManagement.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import Footer from "../components/Footer";
import banner from "../assets/banner.jpg";
import StoreInfoSection from "../components/StoreInfoSection";
import ProductsSection from "../components/ProductsSection";
import AvatarModal from "../components/AvatarModal";
import EditProductModal from "../components/EditProductModal";
import CreateProductModal from "../components/CreateProductModal";
import Item from "../components/Item";
const StoreManagement = () => {
  // State cửa hàng và sản phẩm
  const [storeInfo, setStoreInfo] = useState(null);
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("info"); // "info" hoặc "products"

  // State modal avatar
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // State modal chỉnh sửa sản phẩm
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductData, setEditProductData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    popular: false,
    colors: "",
  });

  // State modal tạo sản phẩm mới
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [createProductData, setCreateProductData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    popular: false,
    colors: "",
  });

  const { backendUrl, token, currency } = useContext(ShopContext);

  // Lấy thông tin cửa hàng
  const getStoreInfo = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/store-management/my-store`, {
        headers: { token },
      });
      if (response.data.success) {
        setStoreInfo(response.data.store);
        setStoreName(response.data.store.storeName);
        setStoreAddress(response.data.store.storeAddress);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error fetching store information"
      );
    }
  };

  // Cập nhật thông tin cửa hàng
  const updateStoreInfo = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${backendUrl}/api/store-management/update-info`,
        { storeName, storeAddress },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setStoreInfo(response.data.store);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error updating store information"
      );
    }
  };

  // Cập nhật avatar cửa hàng qua modal
  const handleSaveAvatar = async () => {
    if (!avatarFile) {
      toast.error("Please select an avatar file.");
      return;
    }
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    try {
      const response = await axios.put(
        `${backendUrl}/api/store-management/update-avatar`,
        formData,
        {
          headers: {
            token,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setStoreInfo({ ...storeInfo, storeLogo: response.data.storeLogo });
        setShowAvatarModal(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error updating store avatar"
      );
    }
  };

  // Khi người dùng chọn file mới cho avatar, cập nhật preview
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Lấy danh sách sản phẩm của cửa hàng
  const getStoreProducts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/store-management/products`, {
        headers: { token },
      });
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error fetching store products"
      );
    }
  };

  // Xoá sản phẩm
  const deleteProduct = async (productId) => {
    try {
      const response = await axios.delete(`${backendUrl}/api/store-management/products/${productId}`, {
        headers: { token },
      });
      if (response.data.success) {
        toast.success(response.data.message);
        getStoreProducts();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error deleting product"
      );
    }
  };

  // Mở modal chỉnh sửa sản phẩm và set dữ liệu ban đầu
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditProductData({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      popular: product.popular,
      colors: product.colors ? product.colors.join(", ") : "",
    });
    setShowEditProductModal(true);
  };

  // Lưu thay đổi sản phẩm sau khi chỉnh sửa
  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    try {
      const response = await axios.put(
        `${backendUrl}/api/store-management/products/${editingProduct._id}`,
        {
          name: editProductData.name,
          price: editProductData.price,
          description: editProductData.description,
          category: editProductData.category,
          popular: editProductData.popular,
          colors: editProductData.colors.split(",").map((c) => c.trim()),
        },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setShowEditProductModal(false);
        setEditingProduct(null);
        getStoreProducts();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error updating product"
      );
    }
  };

  // Mở modal tạo sản phẩm mới
  const handleOpenCreateProduct = () => {
    setCreateProductData({
      name: "",
      price: "",
      description: "",
      category: "",
      popular: false,
      colors: "",
    });
    setShowCreateProductModal(true);
  };

  // Lưu sản phẩm mới
  const handleSaveNewProduct = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/store-management/products`,
        {
          name: createProductData.name,
          price: createProductData.price,
          description: createProductData.description,
          category: createProductData.category,
          popular: createProductData.popular,
          colors: createProductData.colors.split(",").map((c) => c.trim()),
        },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setShowCreateProductModal(false);
        getStoreProducts();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error creating product"
      );
    }
  };

  useEffect(() => {
    if (token) {
      getStoreInfo();
      getStoreProducts();
    }
  }, [token]);

  return (
    <div className="text-tertiary">
      {/* Banner */}
      <div className="relative w-full h-52 overflow-hidden mb-8">
        <img src={banner} alt="StoreBanner" className="object-cover w-full h-full" />
        <div className="absolute top-0 left-0 w-full h-full bg-black/20" />
        {storeInfo && (
          <div
            className="absolute bottom-4 left-6 flex items-center gap-4 cursor-pointer"
            onClick={() => setShowAvatarModal(true)}
          >
            <img
              src={storeInfo.storeLogo || "/default_store_logo.png"}
              alt="StoreAvatar"
              className="w-20 h-20 rounded-full object-cover ring-2 ring-white"
            />
            <div className="text-white">
              <h2 className="bold-22 mb-1">{storeInfo.storeName || "My Store"}</h2>
              <p className="text-white">{storeInfo.storeAddress || "No address"}</p>
            </div>
          </div>
        )}
      </div>

      <div className="max-padd-container">
        {/* Tab buttons */}
        <div className="flex gap-6 mb-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-4 py-2 ${activeTab === "info" ? "border-b-2 border-secondary text-secondary" : ""}`}
          >
            Store Info
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 ${activeTab === "products" ? "border-b-2 border-secondary text-secondary" : ""}`}
          >
            Products
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "info" && (
          <StoreInfoSection
            storeName={storeName}
            setStoreName={setStoreName}
            storeAddress={storeAddress}
            setStoreAddress={setStoreAddress}
            updateStoreInfo={updateStoreInfo}
          />
        )}

        {activeTab === "products" && (
          <ProductsSection
            products={products}
            currency={currency}
            onEdit={handleEditProduct}
            onDelete={deleteProduct}
            onCreate={handleOpenCreateProduct}
          />
        )}
      </div>

      {/* Modal cập nhật avatar */}
      {showAvatarModal && (
        <AvatarModal
          avatarPreview={avatarPreview || storeInfo?.storeLogo || "/default_store_logo.png"}
          handleAvatarChange={handleAvatarChange}
          handleSaveAvatar={handleSaveAvatar}
          onCancel={() => setShowAvatarModal(false)}
        />
      )}

      {/* Modal chỉnh sửa sản phẩm */}
      {showEditProductModal && editingProduct && (
        <EditProductModal
          editProductData={editProductData}
          setEditProductData={setEditProductData}
          handleSaveProduct={handleSaveProduct}
          onCancel={() => {
            setShowEditProductModal(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Modal tạo sản phẩm mới */}
      {showCreateProductModal && (
        <CreateProductModal
          createProductData={createProductData}
          setCreateProductData={setCreateProductData}
          handleSaveNewProduct={handleSaveNewProduct}
          onCancel={() => setShowCreateProductModal(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default StoreManagement;
