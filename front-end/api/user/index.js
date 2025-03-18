import axiosInstance from "../axiosInstance";

export const updateCartItem = async ({ categoryId,productId, action }) => {
  console.log(categoryId,productId)
    try {
      const response = await axiosInstance.post(`/user/cart`, {
        productId,
        categoryId,
        action, 
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating cart item with action ${action}:`, error);
      throw error;
    }
  };


  export const fetchCartItems = async () => {
    const response = await axiosInstance.get("/user/cart");
    return response.data;
  };


  export const fetchProducts = async (categoryId) => {
    try {
      const response = await axiosInstance.get(`/user/fetch-products/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  };
  


  export const orderPayment= async(amount) =>{
    try {
      const response = await axiosInstance.post(`/user/payment/orderr`, {
        amount,
      });
      return response.data;
    } catch (error) {
      console.log(error || "Something went wrong");
    }
  }

  export const verifyPayment=async(data)=> {
    try {
      const response = await axiosInstance.post(`/user/payment/verify`, {
        razorpay_order_id: data.razorpay_order_id,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error || "Something went wrong");
    }
  }



  export const addAddress = async (userId, addressData) => {
    try {
      const response = await axiosInstance.post(`/user/address`, {
        userId,
        ...addressData,
      });
      return response.data;
    } catch (error) {
      console.error("Error adding address:", error);
      throw error;
    }
  }; 



  export const fetchAddresses = async (userId) => {
    try {
      const response = await axiosInstance.get(`/user/address/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching addresses:", error);
      throw error;
    }
  };
  
  export const fetchProduct = async (name,id) => {
    try {
      const response = await axiosInstance.get(`/admin/products/${name}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching addresses:", error);
      throw error;
    }
  };
  
  export const submitReview = async (data) => {
    try {
      const response = await axiosInstance.post(`/user/review`,data);
      return response.data;
    } catch (error) {
      console.error("Error fetching addresses:", error);
      throw error;
    }
  };
  

  export const createOrder = async (orderData) => {
    try {
      const response = await axiosInstance.post(`/user/orders`, {
        user_id: orderData.user_id,  // User ID
        items: orderData.items,      // Array of items { product_id, category_id, quantity, price }
        total_price: orderData.total_price, // Total price for the order
      });
  
      if (response.status === 200) {
        return response.data; // Return response data if the order was successfully created
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      throw error; // Throw error for further handling
    }
  };
  

  export const fetchUserOrders = async (userId) => {
    try {
      const response = await axiosInstance.get(`/user/orders/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw error;
    }
  };
  