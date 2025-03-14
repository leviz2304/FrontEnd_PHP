// src/components/CreateProductModal.jsx
import React, { useState } from "react";
import upload_icon from "../assets/upload.png";
import { FaCheck } from "react-icons/fa6";

const CreateProductModal = ({
  createProductData,
  setCreateProductData,
  handleSaveNewProduct,
  onCancel,
}) => {
  const [images, setImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  });
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e, key) => {
    setImages((prev) => ({ ...prev, [key]: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const colorsArray = createProductData.colors.split(",").map((c) => c.trim());
    const formData = new FormData();
    formData.append("name", createProductData.name);
    formData.append("description", createProductData.description);
    formData.append("price", createProductData.price);
    formData.append("category", createProductData.category);
    formData.append("popular", createProductData.popular);
    formData.append("colors", JSON.stringify(colorsArray));

    Object.keys(images).forEach((key) => {
      if (images[key]) {
        formData.append(key, images[key]);
      }
    });

    setLoading(true);
    try {
      await handleSaveNewProduct(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onSubmit={handleSubmit}
    >
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-md">
        <h3 className="h3 mb-4">Add New Product</h3>
        <div className="flex flex-col gap-y-4">
          {/* Product Name */}
          <div>
            <label className="medium-15">Product Name</label>
            <input
              type="text"
              value={createProductData.name}
              onChange={(e) =>
                setCreateProductData({ ...createProductData, name: e.target.value })
              }
              className="w-full p-2 border rounded"
              placeholder="Product name"
            />
          </div>
          {/* Description */}
          <div>
            <label className="medium-15">Product Description</label>
            <textarea
              value={createProductData.description}
              onChange={(e) =>
                setCreateProductData({ ...createProductData, description: e.target.value })
              }
              className="w-full p-2 border rounded"
              placeholder="Product description"
            />
          </div>
          {/* Price */}
          <div>
            <label className="medium-15">Product Price</label>
            <input
              type="number"
              value={createProductData.price}
              onChange={(e) =>
                setCreateProductData({ ...createProductData, price: e.target.value })
              }
              className="w-full p-2 border rounded"
              placeholder="Product price"
            />
          </div>
          {/* Category */}
          <div>
            <label className="medium-15">Category</label>
            <input
              type="text"
              value={createProductData.category}
              onChange={(e) =>
                setCreateProductData({ ...createProductData, category: e.target.value })
              }
              className="w-full p-2 border rounded"
              placeholder="Product category"
            />
          </div>
          {/* Popular */}
          <div className="flex items-center gap-2">
            <label className="medium-15">Popular</label>
            <input
              type="checkbox"
              checked={createProductData.popular}
              onChange={(e) =>
                setCreateProductData({ ...createProductData, popular: e.target.checked })
              }
            />
          </div>
          {/* Colors */}
          <div>
            <label className="medium-15">Colors (comma separated)</label>
            <input
              type="text"
              value={createProductData.colors}
              onChange={(e) =>
                setCreateProductData({ ...createProductData, colors: e.target.value })
              }
              className="w-full p-2 border rounded"
              placeholder="e.g., Blue, Red"
            />
          </div>
          {/* Upload Images */}
          <div className="flex gap-2 pt-2">
            {["image1", "image2", "image3", "image4"].map((imgKey, i) => (
              <label key={i} htmlFor={imgKey}>
                <img
                  src={
                    images[imgKey]
                      ? URL.createObjectURL(images[imgKey])
                      : upload_icon
                  }
                  alt="upload preview"
                  className="w-16 h-16 aspect-square object-cover ring-1 ring-slate-900/5 rounded-lg"
                />
                <input
                  onChange={(e) => handleImageChange(e, imgKey)}
                  type="file"
                  id={imgKey}
                  hidden
                />
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={onCancel} className="btn-white rounded px-3 py-1">
            Cancel
          </button>
          <button type="submit" className="btn-secondary rounded px-3 py-1" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreateProductModal;
