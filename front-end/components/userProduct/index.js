'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateCartItem, fetchProducts } from "../../api/user";
import { Package, Plus, Minus, ShoppingCart, Search, SlidersHorizontal, X } from "lucide-react";
import { useAlert } from "../../src/app/context/alert/index.js";

const UserProductList = ({ categoryName }) => {
  const { showAlert } = useAlert();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    inStock: false,
  });

  useEffect(() => {
    setIsClient(true);
    getProducts();
  }, [categoryName]);

  // Apply search and filters whenever products, searchTerm or filters change
  useEffect(() => {
    if (products?.data?.length > 0) {
      filterProducts();
    }
  }, [searchTerm, filters, products]);

  const getProducts = async () => {
    setLoading(true);
    try {
      const productList = await fetchProducts(categoryName);
      setProducts(productList);
      setDisplayProducts(productList?.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      showAlert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleCartAction = async (productId, action) => {
    try {
      setLoading(true);
      const categoryId = products.categoryId;
      await updateCartItem({ categoryId, productId, action });
      showAlert("Cart updated successfully");
      getProducts();
    } catch (error) {
      console.error(`Error performing ${action} on cart:`, error);
      showAlert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search term and filters
  const filterProducts = () => {
    if (!products?.data) return;
    
    let filtered = [...products.data];
    
    // Apply search term - search in Brand, Color
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(product => 
        (product.Brand && product.Brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.Color && product.Color.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply price filters - using the Price field specifically
    if (filters.minPrice !== "" && !isNaN(filters.minPrice)) {
      filtered = filtered.filter(product => 
        product.Price >= parseFloat(filters.minPrice)
      );
    }
    
    if (filters.maxPrice !== "" && !isNaN(filters.maxPrice)) {
      filtered = filtered.filter(product => 
        product.Price <= parseFloat(filters.maxPrice)
      );
    }
    
    // Apply stock filter - using the Stock field specifically
    if (filters.inStock) {
      filtered = filtered.filter(product => product.Stock > 0);
    }
    
    setDisplayProducts(filtered);
  };
  
  const resetFilters = () => {
    setSearchTerm("");
    setFilters({
      minPrice: "",
      maxPrice: "",
      inStock: false,
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-600 to-red-500 pt-32">
      <div className="max-w-7xl w-full text-center">
        <div className="flex items-center justify-center mb-12">
          <Package className="w-10 h-10 text-white mr-3" />
          <h1 className="text-4xl font-bold text-white">
            {categoryName} Products
          </h1>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search by brand or color..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* Filter Toggle Button */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-100 text-purple-600 font-medium rounded-lg hover:bg-purple-200 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Expandable Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="mb-1 text-sm text-gray-600">Min Price</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  placeholder="Min price"
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="flex flex-col">
                <label className="mb-1 text-sm text-gray-600">Max Price</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  placeholder="Max price"
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => setFilters({...filters, inStock: e.target.checked})}
                    className="w-5 h-5 text-purple-600 focus:ring-purple-500 rounded"
                  />
                  <span className="ml-2 text-gray-700">In Stock Only</span>
                </label>
              </div>
              
              <button
                onClick={resetFilters}
                className="md:col-span-3 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
              <div className="absolute top-1 left-1 w-14 h-14 border-4 border-purple-300 border-t-transparent rounded-full animate-spin-reverse" />
            </div>
          </div>
        ) : displayProducts?.length > 0 ? (
          <div className="flex flex-wrap justify-center items-center gap-10">
            {displayProducts.map((product, index) => (
              <div
                key={product.id}
                className={`bg-white rounded-xl overflow-hidden shadow-lg transform transition-all duration-500 hover:scale-105 hover:shadow-2xl group relative cursor-pointer ${
                  isClient ? `animate-slideUp_${index * 0.1}s` : ''
                }`}
                onMouseEnter={() => setActiveCard(product.id)}
                onMouseLeave={() => setActiveCard(null)}
              >
                <div className="relative" onClick={() => router.push(`/product/${categoryName}/${product.id}`)}>
                  <img
                    src={product.image_url}
                    alt={product.Brand}
                    style={{ width: "300px", height: "300px" }}
                    className="w-100 h-200 object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                    {product.Brand} {product.Color}
                  </h2>
                  <div className="space-y-2">
                    {Object.entries(product).map(
                      ([key, value]) =>
                        key !== "image_url" && key !== "id" && key !== "Brand" && key !== "Color" && (
                          <div
                            key={key}
                            className="flex justify-between items-center text-gray-600"
                          >
                            <span className="font-medium capitalize">
                              {key === "Stock" && Number(value) < 10 ? (
                                <span className="flex items-center">
                                  Stock: 
                                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                    Few Stocks Left
                                  </span>
                                </span>
                              ) : (
                                `${key}:`
                              )}
                            </span>
                            <span 
                              className={
                                key === "Stock" && Number(value) < 10 
                                  ? "text-red-600 font-bold" 
                                  : ""
                              }
                            >
                              {key === "Price" ? `₹${value}` : value}
                            </span>
                          </div>
                        )
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCartAction(product.id, "REMOVE");
                      }}
                      className="p-2 rounded-full hover:bg-red-100 transition-colors group/btn"
                    >
                      <Minus className="w-5 h-5 text-red-500 group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <ShoppingCart
                      className={`w-6 h-6 text-purple-500 transition-all duration-300 ${
                        activeCard === product.id ? "animate-bounce" : ""
                      }`}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCartAction(product.id, "ADD");
                      }}
                      className="p-2 rounded-full hover:bg-green-100 transition-colors group/btn"
                    >
                      <Plus className="w-5 h-5 text-green-500 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center flex flex-col justify-center items-center h-64">
            <p className="text-xl text-white">
              {searchTerm || Object.values(filters).some(v => v !== "" && v !== false) 
                ? "No products match your search criteria" 
                : `No products found in ${categoryName}.`}
            </p>
            {(searchTerm || Object.values(filters).some(v => v !== "" && v !== false)) && (
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProductList;