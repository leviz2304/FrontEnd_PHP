import React, { useContext, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import Footer from "../components/Footer";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod"); // Available methods: "cod" and "vnpay"
  const {
    navigate,
    products,
    currency,
    delivery_charges,
    cartItems,
    setCartItems,
    getCartAmount,
    token,
    backendUrl,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    // Simple validation: ensure required fields are not empty
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.street ||
      !formData.city ||
      !formData.state ||
      !formData.zipcode ||
      !formData.country ||
      !formData.phone
    ) {
      toast.error("Please fill in all delivery information fields.");
      return;
    }

    try {
      let orderItems = [];
      // Build order items from cartItems
      for (const productId in cartItems) {
        for (const color in cartItems[productId]) {
          if (cartItems[productId][color] > 0) {
            const productData = products.find(
              (product) => product._id === productId
            );
            if (!productData || !productData.storeId) {
              toast.error(`Product ${productId} is missing store information.`);
              return;
            }
            const item = structuredClone(productData);
            item.color = color;
            item.quantity = cartItems[productId][color];
            orderItems.push(item);
          }
        }
      }

      // Ensure there's at least one product
      if (orderItems.length === 0) {
        toast.error("No items in the cart.");
        return;
      }

      // Validate that all items come from the same store
      const storeIds = orderItems.map((item) => item.storeId);
      const uniqueStoreIds = Array.from(new Set(storeIds));
      if (uniqueStoreIds.length > 1) {
        toast.error(
          "All products must be from the same store. Please place separate orders for different stores."
        );
        return;
      }
      if (!uniqueStoreIds[0]) {
        toast.error("Store information is missing for the selected products.");
        return;
      }

      // Construct order payload
      const orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_charges,
        storeId: uniqueStoreIds[0],
      };

      switch (method) {
        case "cod": {
          const response = await axios.post(
            `${backendUrl}/api/order/place`,
            orderData,
            { headers: { token } }
          );
          if (response.data.success) {
            setCartItems({});
            navigate("/order-success");
          } else {
            toast.error(response.data.message);
          }
          break;
        }
        case "vnpay": {
          const response = await axios.post(
            `${backendUrl}/api/order/vnpay`,
            orderData,
            { headers: { token } }
          );
          if (response.data.success) {
            setCartItems({});
            const { vnpUrl } = response.data;
            window.location.replace(vnpUrl);
          } else {
            toast.error(response.data.message);
          }
          break;
        }
        default:
          break;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <div>
      <div className="bg-primary mb-16">
        <form onSubmit={onSubmitHandler} className="max-padd-container py-10">
          <div className="flex flex-col xl:flex-row gap-20 xl:gap-28">
            {/* Delivery Information Form */}
            <div className="flex-1">
              <Title
                title1="Delivery"
                title2="Information"
                titleStyles="text-xl font-bold mb-4"
              />
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={onChangeHandler}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={onChangeHandler}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={onChangeHandler}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                    Street
                  </label>
                  <input
                    type="text"
                    name="street"
                    id="street"
                    placeholder="Street"
                    value={formData.street}
                    onChange={onChangeHandler}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={onChangeHandler}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    id="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={onChangeHandler}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zipcode"
                    id="zipcode"
                    placeholder="Zip Code"
                    value={formData.zipcode}
                    onChange={onChangeHandler}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    id="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={onChangeHandler}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={onChangeHandler}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
            {/* Order Summary and Payment Method */}
            <div className="flex-1 flex flex-col">
              <CartTotal />
              <div className="my-6">
                <h3 className="bold-20 mb-5">Payment Method</h3>
                <div className="flex gap-3">
                  <div
                    onClick={() => setMethod("vnpay")}
                    className={`${
                      method === "vnpay" ? "btn-dark" : "btn-white"
                    } !py-1 text-xs cursor-pointer`}
                  >
                    VNPAY
                  </div>
                  <div
                    onClick={() => setMethod("cod")}
                    className={`${
                      method === "cod" ? "btn-dark" : "btn-white"
                    } !py-1 text-xs cursor-pointer`}
                  >
                    Cash on Delivery
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-secondary">
                Place Order
              </button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default PlaceOrder;
