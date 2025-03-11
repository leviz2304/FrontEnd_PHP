import axios from "axios";
import React, { useEffect, useState } from "react";
import { backend_url } from "../App";
import { toast } from "react-toastify";

const StorePending = ({ token }) => {
  const [pendingStores, setPendingStores] = useState([]);

  // Fetch pending store requests
  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/store/pending`, {
        headers: { token },
      });
      if (response.data.success) {
        setPendingStores(response.data.pendingStores);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // Approve a store request
  const approveRequest = async (storeId) => {
    try {
      const response = await axios.post(
        `${backend_url}/api/store/approve`,
        { storeId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchRequests();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // Reject a store request
  const rejectRequest = async (storeId) => {
    try {
      // Assuming your backend has an endpoint /api/store/reject that accepts { storeId }
      const response = await axios.post(
        `${backend_url}/api/store/reject`,
        { storeId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchRequests();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  return (
    <div className="px-2 sm:px-8 sm:mt-14">
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-5 md:grid-cols-5 items-center py-1 px-2 bg-white bold-14 sm:bold-15 mb-1 rounded">
          <h5>Owner ID</h5>
          <h5>Store Name</h5>
          <h5>Store Address</h5>
          <h5>Status</h5>
          <h5>Action</h5>
        </div>
        {pendingStores.length > 0 ? (
          pendingStores.map((item) => (
            <div
              key={item._id}
              className="grid grid-cols-5 md:grid-cols-5 items-center gap-2 p-1 bg-white rounded-xl"
            >
              <h5 className="text-sm font-semibold">{item.ownerId}</h5>
              <h5 className="text-sm font-semibold">{item.storeName}</h5>
              <h5 className="text-sm font-semibold">{item.storeAddress}</h5>
              <h5 className="text-sm font-semibold">{item.status}</h5>
              <div className="flex gap-2">
                <button
                  onClick={() => approveRequest(item._id)}
                  className="btn-dark px-3 py-1 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => rejectRequest(item._id)}
                  className="btn-dark px-3 py-1 rounded bg-red-500"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center py-4">No pending store requests.</p>
        )}
      </div>
    </div>
  );
};

export default StorePending;
