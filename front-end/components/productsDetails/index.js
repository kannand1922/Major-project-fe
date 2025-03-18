"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { fetchProduct, submitReview } from "../../api/user";
import { useAlert } from "../../src/app/context/alert";

const ProductDetails = () => {
  const { showAlert } = useAlert();
  const { catgoryName, productId } = useParams();
  const [productData, setProductData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!catgoryName || !productId) return;
    fetchData();
  }, [catgoryName, productId]);

  const fetchData = async () => {
    try {
      const response = await fetchProduct(catgoryName, productId);
      setProductData(response);
      setReviews(response?.reviews || []);
    } catch (error) {
      console.error("Error fetching product data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const product = productData.data[0];
      const response = await submitReview({
        category_id: productData.categoryId,
        product_id: product.id,
        user_id: localStorage.getItem("userId"),
        rating,
        comment,
      });

      if (response) {
        showAlert("Review added successfully!");
        fetchData();
        setComment("");
        setRating(5);
      }
    } catch (error) {
      console.error("Error adding review:", error);
      showAlert("Only purchasd perons can review products");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-pulse text-xl text-gray-500">Loading...</div>
    </div>
  );

  if (!productData || !productData.data.length) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        Product not found
      </div>
    );
  }

  const product = productData.data[0];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pt-[120px]">
      <div className="grid md:grid-cols-2 gap-8 bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Product Image */}
        <div className="relative aspect-square">
          <img 
            src={product.image_url} 
            alt={product.Brand}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Product Details */}
        <div className="p-6 space-y-6">
          {/* Product Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {product.Brand} Paint
            </h1>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold text-green-600">
                ₹{product.Price}
              </span>
              {product.Stock <= 5 && (
                <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full animate-pulse">
                  Only {product.Stock} left in stock
                </span>
              )}
            </div>
          </div>

          {/* Product Details Grid */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            {Object.entries(product).map(([key, value]) => {
              if (
                key === "id" || 
                key === "image_url" || 
                value === null || 
                value === undefined
              ) return null;

              return (
                <div 
                  key={key} 
                  className="flex flex-col"
                >
                  <span className="text-sm text-gray-500 capitalize">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span className="font-medium text-gray-800">
                    {key === "Stock" && Number(value) <= 5 ? (
                      <span className="text-red-600 font-bold">{value}</span>
                    ) : (
                      value
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Add to Cart / Buy Now Buttons */}
          {/* <div className="flex space-x-4">
            <button className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition">
              Add to Cart
            </button>
            <button className="flex-1 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition">
              Buy Now
            </button>
          </div> */}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8 bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Customer Reviews
        </h2>

        {/* Existing Reviews */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div 
                key={index} 
                className="bg-gray-50 p-4 rounded-lg"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-yellow-500">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No reviews yet</p>
        )}

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Write a Review
          </h3>
          <div>
            <label className="block text-gray-700 mb-2">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-md"
            >
              {[5, 4, 3, 2, 1].map((num) => (
                <option key={num} value={num}>
                  {num} ★
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              rows="4"
              required
              placeholder="Share your experience..."
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductDetails;