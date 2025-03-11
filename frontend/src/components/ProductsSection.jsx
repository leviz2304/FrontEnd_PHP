// src/components/ProductsSection.jsx
import React from "react";
import StoreProductItem from "./StoreProductItem";

const ProductsSection = ({ products, currency, onEdit, onDelete, onCreate }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="h3">My Products</h3>
        <button onClick={onCreate} className="btn-secondary px-4 py-2">
          Add Product
        </button>
      </div>
      {products.length > 0 ? (
        <div className="grid grid-cols-4 md:grid-cols-3 gap-4">
          {products.map((prod) => (
            <StoreProductItem
              key={prod._id}
              product={prod}
              currency={currency}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <p>No products found for your store.</p>
      )}
    </div>
  );
};

export default ProductsSection;
