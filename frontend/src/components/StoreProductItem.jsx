// src/components/StoreProductItem.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TbPencil, TbTrash } from "react-icons/tb";

const StoreProductItem = ({ product, currency, onEdit, onDelete }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="overflow-hidden border p-4 rounded-lg">
      {/* IMAGE */}
      <Link
        to={`/product/${product._id}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flexCenter p-2 bg-[#f5f5f5] overflow-hidden relative"
      >
        <img
          src={
            product.image.length > 1 && hovered
              ? product.image[1]
              : product.image[0]
          }
          alt="productImg"
          className="object-cover w-full h-full transition-all duration-300"
        />
      </Link>
      {/* INFO */}
      <div className="p-3">
        <h4 className="bold-15 line-clamp-1 !py-0">{product.name}</h4>
        <div className="flexBetween pt-1">
          <p className="h5">{product.category}</p>
          <h5 className="h5 pr-2">
            ${product.price}.00
          </h5>
        </div>
        <p className="line-clamp-2 py-1">{product.description}</p>
        {/* Edit & Delete Buttons */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onEdit(product)}
            className="btn-secondary rounded px-3 py-1 flex items-center gap-1"
          >
            <TbPencil /> Edit
          </button>
          <button
            onClick={() => onDelete(product._id)}
            className="btn-white rounded px-3 py-1 text-red-500 flex items-center gap-1"
          >
            <TbTrash /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreProductItem;
