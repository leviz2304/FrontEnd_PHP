// src/components/StoreInfoSection.jsx
import React from "react";

const StoreInfoSection = ({ storeName, setStoreName, storeAddress, setStoreAddress, updateStoreInfo }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-10">
      <h3 className="h3 mb-4">Store Information</h3>
      <form onSubmit={updateStoreInfo} className="flex flex-col gap-y-4">
        <div>
          <label className="medium-15">Store Name</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="Enter store name"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="medium-15">Store Address</label>
          <input
            type="text"
            value={storeAddress}
            onChange={(e) => setStoreAddress(e.target.value)}
            placeholder="Enter store address"
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="btn-secondary mt-2 w-fit">
          Update Store Info
        </button>
      </form>
    </div>
  );
};

export default StoreInfoSection;
