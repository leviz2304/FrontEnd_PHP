import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import {
  FaCheck,
  FaHeart,
  FaStar,
  FaStarHalfStroke,
  FaTruckFast,
} from "react-icons/fa6";
import { TbShoppingBagPlus } from "react-icons/tb";
import ProductDescription from "../components/ProductDescription";
import ProductFeatures from "../components/ProductFeatures";
import RelatedProducts from "../components/RelatedProducts";
import Footer from "../components/Footer";

import ReviewList from "../components/ReviewList";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [storeInfo, setStoreInfo] = useState(null);
  const { backendUrl, token } = useContext(ShopContext); 

  // Fetch product data from ShopContext
  const fetchProductData = () => {
    const selectedProduct = products.find((item) => item._id === productId);
    if (selectedProduct) {
      setProduct(selectedProduct);
      setMainImage(selectedProduct.image[0]);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  // Once product is fetched, get store info using the storeId
  useEffect(() => {
    if (product && product.storeId) {
      axios
        .get(`${backendUrl}/api/store/single?storeId=${product.storeId}`)
        .then((response) => {
          if (response.data.success) {
            setStoreInfo(response.data.store);
          }
        })
        .catch((error) => console.error(error));
    }
  }, [product]);

  if (!product) {
    return <div className="flexCenter h-screen">Loading...</div>;
  }

  return (
    <div>
      <div className="max-padd-container py-10">
        {/* PRODUCT DATA */}
        <div className="flex gap-10 flex-col xl:flex-row rounded-2xl p-3 mb-6">
          {/* IMAGE SECTION */}
          <div className="flex flex-col gap-4">
            <div className="w-80 h-80 border rounded-lg overflow-hidden">
              <img
                src={mainImage}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex gap-2">
              {product.image.map((img, i) => (
                <div
                  key={i}
                  className="w-16 h-16 border rounded cursor-pointer overflow-hidden"
                  onClick={() => setMainImage(img)}
                >
                  <img
                    src={img}
                    alt={`thumb-${i}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
          {/* PRODUCT INFO SECTION */}
          <div className="flex-1 rounded-2xl px-5 py-3 bg-primary">
            <h3 className="h3 leading-none">{product.name}</h3>
            {/* RATING */}
            <div className="flex items-baseline gap-x-5">
              <div className="flex items-center gap-x-2 text-secondary">
                <div className="flex gap-x-2 text-secondary">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStarHalfStroke />
                </div>
                <span className="medium-14">(123)</span>
              </div>
            </div>
            {/* PRICE */}
            <h4 className="h4 my-2">
              {currency}
              {product.price}.00
            </h4>
            {/* DESCRIPTION */}
            <p className="max-w-[555px]">{product.description}</p>
            {/* STORE INFORMATION */}
            
            {/* COLOR OPTIONS */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex flex-col gap-4 my-4">
                <p className="medium-15">Choose a color:</p>
                <div className="flex gap-2">
                  {product.colors.map((col, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(col)}
                      style={{ background: col }}
                      className={`w-9 h-9 rounded-full flexCenter border ${
                        selectedColor === col
                          ? "border-2 border-secondary"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedColor === col && (
                        <FaCheck
                          className={col === "White" ? "text-black" : "text-white"}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-x-4">
              <button
                onClick={() => addToCart(product._id, selectedColor)}
                className="btn-secondary rounded-lg sm:w-1/2 flexCenter gap-x-2 capitalize"
              >
                Add to Cart <TbShoppingBagPlus />
              </button>
              <button className="btn-white rounded-lg py-3.5">
                <FaHeart />
              </button>
            </div>
            {/* DELIVERY INFO */}
            <div className="flex items-center gap-x-2 mt-3">
              <FaTruckFast className="text-lg" />
              <span className="medium-14">
                Free Delivery on orders over 500$
              </span>
            </div>
            <hr className="my-3 w-2/3" />
            <div className="mt-2 flex flex-col gap-1 text-gray-30 text-[14px]">
              <p>Authenticity You Can Trust</p>
              <p>Enjoy Cash on Delivery for Your Convenience</p>
              <p>Easy Returns and Exchanges Within 7 Days</p>
            </div>
          </div>
        </div>
        
        {storeInfo && (
              <div className="mt-4 p-3 bg-white rounded-lg">
                <h4 className="bold-18">Seller Information</h4>
                <p className="medium-15">
                  Store Name: <span className="font-bold">{storeInfo.storeName}</span>
                </p>
                {storeInfo.storeAddress && (
                  <p className="medium-15">
                    Address: <span>{storeInfo.storeAddress}</span>
                  </p>
                )}
              </div>
            )}
                      <ReviewList productId={productId}backendUrl={backendUrl} token={token} />

        <RelatedProducts category={product.category} />

      </div>
      <Footer />
    </div>
  );
};

export default Product;
