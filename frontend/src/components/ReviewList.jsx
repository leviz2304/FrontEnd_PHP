import React, { useEffect, useState } from "react";
import axios from "axios";

const ReviewList = ({ productId, backendUrl, token }) => {
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/review/product/${productId}`,
        { headers: { token } }
      );
      if (response.data.success) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId]);

  if (reviews.length === 0) {
    return <p className="text-sm text-gray-500 mt-2">No reviews yet.</p>;
  }

  return (
    <div className="reviews mt-4 space-y-2">
      {reviews.map((review) => (
        <div key={review._id} className="border-b pb-2">
          <p className="text-sm">
            <strong>Rating:</strong> {review.rating} / 5
          </p>
          <p className="text-sm">{review.reviewText}</p>
          <p className="text-xs text-gray-400">
            Reviewed on {new Date(review.date).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
