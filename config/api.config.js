// api.config.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";

export const BASE_URL = "https://colala.hmstech.xyz/api";

const API = {

  // Auth

  REGISTER: `${BASE_URL}/auth/register`,
  LOGIN: `${BASE_URL}/auth/login`,
  FORGOT_PASSWORD: `${BASE_URL}/auth/forget-password`,
  RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
  VERIFY_OTP: `${BASE_URL}/auth/verify-otp`,
  CATEGORIES: `${BASE_URL}/categories`,
  POSTS: `${BASE_URL}/posts`,
  POST_LIKE: (postId) => `${BASE_URL}/posts/${postId}/like`,
  POST_COMMENTS: (postId) => `${BASE_URL}/posts/${postId}/comments`,
  CATEGORY_PRODUCTS: (categoryId) => `${BASE_URL}/buyer/categories/${categoryId}/products`,
  PRODUCT_DETAILS: (id) => `${BASE_URL}/buyer/product-details/${id}`,
  ADD_TO_CART: `${BASE_URL}/buyer/cart/items`,
  CART: `${BASE_URL}/buyer/cart`,
  ADDRESSES: `${BASE_URL}/buyer/addresses`,                  // GET (list), POST (create)
  ADDRESS_ID: (id) => `${BASE_URL}/buyer/addresses/${id}`,
  CART_ITEM: (itemId) => `${BASE_URL}/buyer/cart/items/${itemId}`,
  STORES: `${BASE_URL}/buyer/stores`,
  STORE_DETAILS: (id) => `${BASE_URL}/buyer/stores/${id}`,
  CHECKOUT_PREVIEW: `${BASE_URL}/buyer/checkout/preview`,   // POST
  GET_BALANCE: `${BASE_URL}/buyer/getBalance`,
  CHECKOUT_PLACE: `${BASE_URL}/buyer/checkout/place`,
  ORDERS: `${BASE_URL}/buyer/orders`,
  ORDER_DETAILS: (id) => `${BASE_URL}/buyer/orders/${id}`,
  CHATS: `${BASE_URL}/buyer/chats`,
  CHAT_MESSAGES: (chatId) => `${BASE_URL}/buyer/chats/${chatId}/messages`,
  SEND_CHAT_MESSAGE: (chatId) => `${BASE_URL}/buyer/chats/${chatId}/send`,
  SUPPORT_TICKETS: `${BASE_URL}/buyer/support/tickets`,        // GET (index), POST (create)
  SUPPORT_TICKET_ID: (id) => `${BASE_URL}/buyer/support/tickets/${id}`,
  Supoort_Ticket_Message: `${BASE_URL}/buyer/support/messages`,
  SERVICES: `${BASE_URL}/seller/service`,
  SEARCH: `${BASE_URL}/search`,
  STORE_REVIEWS: (id) => `${BASE_URL}/buyer/stores/${id}/reviews`,
  Get_All_Products: `${BASE_URL}/buyer/product/get-all`,





  Edit_Profile: `${BASE_URL}/auth/edit-profile`,
  Services_Categories: `${BASE_URL}/service-categories`,
  Services_By_Category: (categoryId) => `${BASE_URL}/service-categories/${categoryId}`,
  Services_Detail: (serviceId) => `${BASE_URL}/seller/service/${serviceId}`,
  Saved_Toggle_Item: `${BASE_URL}/buyer/saved-items/toggle`,
  Check_Saved_Item: `${BASE_URL}/buyer/saved-items/check`,
  Toggle_Follow_Store: `${BASE_URL}/buyer/followed-stores/toggle`,
  Check_Followed_Store: `${BASE_URL}/buyer/followed-stores/check`,
  Get_Followed_Stores: `${BASE_URL}/buyer/followed-stores`,
  List_Of_All_Saved_Items: `${BASE_URL}/buyer/saved-items`,
  Escrow_Wallet: `${BASE_URL}/faqs/escrow`,
  Escrow_Wallet_History: `${BASE_URL}/faqs/escrow/history`,
  Create_Dispute: `${BASE_URL}/faqs/dispute`,
  All_Disputes: `${BASE_URL}/faqs/dispute/all`,
  Dispute_Details: `${BASE_URL}/faqs/dispute/details`,
  // Support Tickets
  Support_Tickets: `${BASE_URL}/buyer/support/tickets`,
  Support_Ticket_Details: (ticketId) => `${BASE_URL}/buyer/support/tickets/${ticketId}`,
  Support_Ticket_Message: `${BASE_URL}/buyer/support/messages`,
  // add to API:
  START_CHAT: (storeId) => `${BASE_URL}/buyer/chats/start/${storeId}`,
  My_Points: `${BASE_URL}/my-points`,
  Get_Post_Comments: (postId) => `${BASE_URL}/posts/${postId}/comments`,
  All_Brands: `${BASE_URL}/brands`,
  User_Review: `${BASE_URL}/user-reveiws`,
  Get_Top_Selling: `${BASE_URL}/buyer/products/top-selling`,
  Get_Faqs: `${BASE_URL}/faqs/category/name/general`,
};

export default API;

// ---- Axios instance with Bearer token (if you add login later)
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("auth_token"); // optional
    console.log('API Request - URL:', config.url);
    console.log('API Request - Token:', token ? 'Present' : 'Missing');
    config.headers = {
      ...(config.headers || {}),
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    console.log('API Request - Headers:', config.headers);
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (r) => {
    console.log('API Response - Status:', r.status);
    console.log('API Response - Data:', r.data);
    return r;
  },
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const message =
      data?.message || error?.message || "Something went wrong. Please try again.";
    console.log('API Response Error - Status:', status);
    console.log('API Response Error - Data:', data);
    console.log('API Response Error - Message:', message);
    return Promise.reject({ status, data, message });
  }
);

// ---- Tiny HTTP helper (unwraps response.data)
// api.config.js (only the http.post changed)
// export const http = {
//   get: (url, params, config) =>                      // <-- add
//     api.get(url, { params, ...(config || {}) }).then((r) => r.data),
//   post: (url, body, config) => {
//     const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
//     return api
//       .post(url, body, {
//         ...(config || {}),
//         headers: {
//           ...(config?.headers || {}),
//           ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
//         },
//       })
//       .then((r) => r.data);
//   },
// };
// ---- Tiny HTTP helper (unwraps response.data)
export const http = {
  get: (url, params, config) =>
    api.get(url, { params, ...(config || {}) }).then((r) => r.data),

  post: (url, body, config) => {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    return api
      .post(url, body, {
        ...(config || {}),
        headers: {
          ...(config?.headers || {}),
          ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
        },
      })
      .then((r) => r.data);
  },

  put: (url, body, config) => {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    console.log('HTTP PUT - URL:', url);
    console.log('HTTP PUT - Body type:', typeof body, 'Is FormData:', isFormData);
    console.log('HTTP PUT - Body:', body);

    return api
      .put(url, body, {
        ...(config || {}),
        headers: {
          ...(config?.headers || {}),
          ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
        },
      })
      .then((r) => {
        console.log('HTTP PUT - Response:', r);
        return r.data;
      })
      .catch((error) => {
        console.log('HTTP PUT - Error:', error);
        throw error;
      });
  },

  delete: (url, config) =>
    api.delete(url, { ...(config || {}) }).then((r) => r.data),
};




// ---- Query Client (use in App root)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60 * 1000, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});

// ---- Mutation hook for Register
export const useRegister = (opts) =>
  useMutation({
    mutationFn: (payload) => http.post(API.REGISTER, payload),
    ...opts,
  });


export const useLogin = (opts) =>
  useMutation({
    mutationFn: (payload) => http.post(API.LOGIN, payload),
    ...opts,
  });

export const useForgotPassword = (opts) =>
  useMutation({
    mutationFn: (payload) => {
      console.log('ForgotPassword API call - URL:', API.FORGOT_PASSWORD);
      console.log('ForgotPassword API call - Payload:', payload);
      return http.post(API.FORGOT_PASSWORD, payload);
    },
    onError: (error) => {
      console.error('ForgotPassword error:', error);
      if (opts?.onError) opts.onError(error);
    },
    ...opts,
  });

export const useVerifyOtp = (opts) =>
  useMutation({
    // expects: { email, code }
    mutationFn: (payload) => {
      console.log('VerifyOtp API call - URL:', API.VERIFY_OTP);
      console.log('VerifyOtp API call - Payload:', payload);
      return http.post(API.VERIFY_OTP, payload);
    },
    onError: (error) => {
      console.error('VerifyOtp error:', error);
      if (opts?.onError) opts.onError(error);
    },
    ...opts,
  });

export const useResetPassword = (opts) =>
  useMutation({
    mutationFn: (payload) => {
      console.log('ResetPassword API call - URL:', API.RESET_PASSWORD);
      console.log('ResetPassword API call - Payload:', payload);
      return http.post(API.RESET_PASSWORD, payload);
    },
    onError: (error) => {
      console.error('ResetPassword error:', error);
      if (opts?.onError) opts.onError(error);
    },
    ...opts,
  });

export const useCategories = (options) =>
  useQuery({
    queryKey: ["categories"],
    queryFn: () => http.get(API.CATEGORIES),
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const usePosts = (page = 1, options) =>
  useQuery({
    queryKey: ["posts", page],
    queryFn: () => http.get(API.POSTS, { page }),
    keepPreviousData: true,
    staleTime: 60 * 1000,
    ...options,
  });

export const useTogglePostLike = (opts) =>
  useMutation({
    mutationFn: (postId) => http.post(API.POST_LIKE(postId)),
    // You can invalidate posts if you want server to re-hydrate:
    // onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
    ...opts,
  });

// Add a comment to a post
export const useAddPostComment = (opts) =>
  useMutation({
    mutationFn: ({ postId, body }) => http.post(API.POST_COMMENTS(postId), { body }),
    // onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
    ...opts,
  });
export const setAuthUser = async (user) => AsyncStorage.setItem("auth_user", JSON.stringify(user));


// Optional token helpers for when you add login
export const setAuthToken = async (token) =>
  AsyncStorage.setItem("auth_token", token);
export const clearAuthToken = async () => AsyncStorage.removeItem("auth_token");
export const getAuthToken = async () => AsyncStorage.getItem("auth_token");


export const useCategoryProducts = (categoryId, page = 1, options) =>
  useQuery({
    enabled: !!categoryId,
    queryKey: ['categoryProducts', categoryId, page],
    queryFn: () => http.get(API.CATEGORY_PRODUCTS(categoryId), { page }),
    keepPreviousData: true,
    staleTime: 60 * 1000,
    ...options,
  });

export const useProductDetails = (productId, options) =>
  useQuery({
    enabled: !!productId,
    queryKey: ["productDetails", productId],
    queryFn: () => http.get(API.PRODUCT_DETAILS(productId)),
    staleTime: 60 * 1000,
    ...options,
  });


export const useAddToCart = (opts) =>
  useMutation({
    mutationFn: (payload) => http.post(API.ADD_TO_CART, payload),
    ...opts,
  });

export const useCart = (options) =>
  useQuery({
    queryKey: ["cart"],
    queryFn: () => http.get(API.CART),
    staleTime: 60 * 1000,
    ...options,
  });

export const useUpdateCartItem = (opts) =>
  useMutation({
    // expects: { itemId, qty }
    mutationFn: ({ itemId, qty }) =>
      http.post(API.CART_ITEM(itemId), { qty }),
    onSuccess: (res) => {
      console.log("Update qty response:", JSON.stringify(res, null, 2));
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      opts?.onSuccess?.(res);
    },
    onError: (err) => {
      console.log("Update qty error:", err);
      opts?.onError?.(err);
    },
  });

export const useDeleteCartItem = (opts) =>
  useMutation({
    // expects: itemId
    mutationFn: (itemId) => http.delete(API.CART_ITEM(itemId)),
    onSuccess: (res) => {
      console.log("Delete item response:", JSON.stringify(res, null, 2));
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      opts?.onSuccess?.(res);
    },
    onError: (err) => {
      console.log("Delete item error:", err);
      opts?.onError?.(err);
    },
  });

export const useWalletBalance = (options) =>
  useQuery({
    queryKey: ["walletBalance"],
    queryFn: () => http.get(API.GET_BALANCE),
    staleTime: 60 * 1000,
    ...options,
  });

// Auto-runs only when both addressId & method are present
export const useCheckoutPreview = (addressId, paymentMethod, options) =>
  useQuery({
    enabled: !!addressId && !!paymentMethod,
    queryKey: ["checkoutPreview", addressId, paymentMethod],
    queryFn: () =>
      http.post(API.CHECKOUT_PREVIEW, {
        delivery_address_id: String(addressId),
        payment_method: String(paymentMethod),
      }),
    staleTime: 0,
    ...options,
  });


export const useCheckoutPlace = (opts) =>
  useMutation({
    mutationFn: ({ delivery_address_id, payment_method }) =>
      http.post(API.CHECKOUT_PLACE, {
        delivery_address_id: String(delivery_address_id),
        payment_method: String(payment_method),
      }),
    ...opts,
  });



// Addresses 
export const useAddresses = (options) =>
  useQuery({
    queryKey: ["addresses"],
    queryFn: () => http.get(API.ADDRESSES),
    staleTime: 60 * 1000,
    ...options,
  });

export const useAddAddress = (opts) =>
  useMutation({
    mutationFn: (payload) => http.post(API.ADDRESSES, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
    ...opts,
  });

export const useUpdateAddress = (opts) =>
  useMutation({
    mutationFn: ({ id, ...payload }) => http.put(API.ADDRESS_ID(id), payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
    ...opts,
  });

export const useDeleteAddress = (opts) =>
  useMutation({
    mutationFn: (id) => http.delete(API.ADDRESS_ID(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
    ...opts,
  });

export const useStores = (options) =>
  useQuery({
    queryKey: ["stores"],
    queryFn: () => http.get(API.STORES),
    staleTime: 60 * 1000,
    ...options,
  });

export const useOrders = (page = 1, options) =>
  useQuery({
    queryKey: ["orders", page],
    queryFn: () => http.get(API.ORDERS, { page }),
    keepPreviousData: true,
    staleTime: 60 * 1000,
    ...options,
  });


export const useOrderDetails = (orderId, options) =>
  useQuery({
    enabled: !!orderId,
    queryKey: ["orderDetails", orderId],
    queryFn: () => http.get(API.ORDER_DETAILS(orderId)),
    staleTime: 60 * 1000,
    ...options,
  });

export const useChats = (options) =>
  useQuery({
    queryKey: ["chats"],
    queryFn: () => http.get(API.CHATS),
    staleTime: 60 * 1000,
    ...options,
  });

export const useChatMessages = (chatId, options) =>
  useQuery({
    enabled: !!chatId,
    queryKey: ["chatMessages", chatId],
    queryFn: () => http.get(API.CHAT_MESSAGES(chatId)),
    staleTime: 60 * 1000,
    ...options,
  });

export const useSendChatMessage = (opts) =>
  useMutation({
    // expects: { chatId, message, image }  (image optional; keep hardcoded if your UI doesn’t need it yet)
    mutationFn: ({ chatId, message, image }) => {
      const body = image
        ? (() => { const fd = new FormData(); fd.append('message', message || ''); fd.append('image', { uri: image, name: 'upload.jpg', type: 'image/jpeg' }); return fd; })()
        : { message };
      return http.post(API.SEND_CHAT_MESSAGE(chatId), body);
    },
    onSuccess: (res, vars) => {
      // refresh messages thread + chat list meta (last msg, time, unread)
      queryClient.invalidateQueries({ queryKey: ['chatMessages', vars.chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      opts?.onSuccess?.(res, vars);
    },
    ...opts,
  });

// List tickets (optionally by status & pagination)
export const useSupportTickets = (params = {}, options) =>
  useQuery({
    queryKey: ["supportTickets", params],
    queryFn: () => http.get(API.SUPPORT_TICKETS, params), // expects backend to honor ?status=&page=
    keepPreviousData: true,
    staleTime: 60 * 1000,
    ...options,
  });

// Create ticket
export const useCreateSupportTicket = (opts) =>
  useMutation({
    // expects: { category, subject, description, order_id?, store_order_id?, image? }
    mutationFn: async (payload) => {
      const { image, ...rest } = payload || {};

      // If backend supports file upload, switch to FormData here:
      // const fd = new FormData();
      // Object.entries(rest).forEach(([k, v]) => fd.append(k, v ?? ""));
      // if (image) {
      //   fd.append("attachment", {
      //     uri: image,
      //     name: "attachment.jpg",
      //     type: "image/jpeg",
      //   });
      // }
      // return http.post(API.SUPPORT_TICKETS, fd);

      // JSON post (no attachment)
      return http.post(API.SUPPORT_TICKETS, {
        ...rest,
        order_id: rest.order_id ?? null,
        store_order_id: rest.store_order_id ?? null,
      });
    },
    onSuccess: (res, vars) => {
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
      opts?.onSuccess?.(res, vars);
    },
    onError: (err, vars) => {
      opts?.onError?.(err, vars);
    },
  });

export const useStoreDetails = (id, options) =>
  useQuery({
    enabled: !!id,
    queryKey: ["storeDetails", id],
    queryFn: () => http.get(API.STORE_DETAILS(id)),
    staleTime: 60 * 1000,
    ...options,
  });


export const useGetAllProducts = (options) =>
  useQuery({
    queryKey: ["getAllProducts"],
    queryFn: () => http.get(API.Get_All_Products),
    staleTime: 60 * 1000,
    ...options,
  });
export const useEditProfile = (opts) =>
  useMutation({
    mutationFn: (payload) => {
      console.log('EditProfile API call - URL:', API.Edit_Profile);
      console.log('EditProfile API call - Payload:', payload);
      return http.post(API.Edit_Profile, payload);
    },
    onError: (error) => {
      // Log the error or display it as needed
      console.error('Error updating profile:', error);

      // You can also handle error state in your UI, like setting an error message
      if (opts?.onError) opts.onError(error); // Call custom onError if passed via opts
    },
    ...opts,
  });



export const useServicesCategories = (options) =>
  useQuery({
    queryKey: ["servicesCategories"],
    queryFn: () => http.get(API.Services_Categories),
    staleTime: 60 * 1000,
    ...options,
  });

export const useServicesByCategory = (categoryId, options) =>
  useQuery({
    queryKey: ["servicesByCategory", categoryId],
    queryFn: () => http.get(API.Services_By_Category(categoryId)),
    staleTime: 60 * 1000,
    ...options,
  });

export const useServicesDetail = (serviceId, options) =>
  useQuery({
    queryKey: ["servicesDetail", serviceId],
    queryFn: () => http.get(API.Services_Detail(serviceId)),
    staleTime: 60 * 1000,
    ...options,
  });

export const useServices = (options) =>
  useQuery({
    queryKey: ["services"],
    queryFn: () => http.get(API.SERVICES),
    staleTime: 60 * 1000,
    ...options,
  });

export const useSearch = (activeTab, q, options) => {
  // map UI tabs -> API expects singular
  const typeMap = { products: "product", stores: "store", services: "service" };
  const type = typeMap[activeTab];

  return useQuery({
    enabled: !!type && !!q,                 // only call when tab selected AND query present
    queryKey: ["search", type, q],
    queryFn: () => http.get(API.SEARCH, { type, q }),
    staleTime: 60 * 1000,
    ...options,
  });
}






export const useSavedToggleItem = (opts) =>
  useMutation({
    mutationFn: (payload) => http.post(API.Saved_Toggle_Item, payload),
    ...opts,
  });

export const useCheckSavedItem = (opts) =>
  useMutation({
    mutationFn: (payload) => http.post(API.Check_Saved_Item, payload),
    ...opts,
  });

export const useToggleFollowStore = (opts) =>
  useMutation({
    mutationFn: (payload) => http.post(API.Toggle_Follow_Store, payload),
    ...opts,
  });

export const useCheckFollowedStore = (opts) =>
  useMutation({
    mutationFn: (payload) => http.post(API.Check_Followed_Store, payload),
    ...opts,
  });

export const useGetFollowedStores = (opts) =>
  useQuery({
    queryKey: ["followedStores"],
    queryFn: () => http.get(API.Get_Followed_Stores),
    ...opts,
  });

export const useListOfAllSavedItems = (opts) =>
  useQuery({
    queryKey: ["listOfAllSavedItems"],
    queryFn: () => http.get(API.List_Of_All_Saved_Items),
    ...opts,
  });

// Escrow Wallet Hooks
export const useEscrowWallet = (options) =>
  useQuery({
    queryKey: ["escrowWallet"],
    queryFn: () => http.get(API.Escrow_Wallet),
    ...options,
  });

export const useEscrowWalletHistory = (page = 1, options) =>
  useQuery({
    queryKey: ["escrowWalletHistory", page],
    queryFn: () => http.get(API.Escrow_Wallet_History, { page }),
    ...options,
  });


// Dispute Hooks
export const useCreateDispute = (opts) =>
  useMutation({
    mutationFn: (payload) => http.post(API.Create_Dispute, payload),
    ...opts,
  });

export const useAllDisputes = (options) =>
  useQuery({
    queryKey: ["allDisputes"],
    queryFn: () => http.get(API.All_Disputes),
    ...options,
  });

export const useDisputeDetails = (disputeId, options) =>
  useQuery({
    enabled: !!disputeId,
    queryKey: ["disputeDetails", disputeId],
    queryFn: () => http.get(API.Dispute_Details(disputeId)),
    ...options,
  });


export const useSupportTicketDetails = (ticketId, options) =>
  useQuery({
    enabled: !!ticketId,
    queryKey: ["supportTicketDetails", ticketId],
    queryFn: () => http.get(API.Support_Ticket_Details(ticketId)),
    ...options,
  });


export const useSupportTicketMessage = (opts) =>
  useMutation({
    mutationFn: (payload) => {
      console.log("API Request - Support Ticket Message:", {
        url: API.Support_Ticket_Message,
        payload: payload
      });
      return http.post(API.Support_Ticket_Message, payload);
    },
    ...opts,
    onSuccess: (res, vars) => {
      console.log("API Response - Support Ticket Message Success:", res);
      queryClient.invalidateQueries({ queryKey: ["supportTicketDetails", vars.ticketId] });
      opts?.onSuccess?.(res, vars);
    },
    onError: (err, vars) => {
      opts?.onError?.(err, vars);
    },


  });


export const useStoreReviews = (storeId, options) =>
  useQuery({
    enabled: !!storeId,
    queryKey: ["storeReviews", storeId],
    queryFn: () => http.get(API.STORE_REVIEWS(storeId)),
    staleTime: 60 * 1000,
    ...options,
  });

export const useAddStoreReview = (opts) =>
  useMutation({
    mutationFn: async ({ storeId, rating, comment, images }) => {
      // If images are provided, send multipart/form-data, otherwise JSON
      const hasImages = Array.isArray(images) && images.length > 0;

      if (hasImages) {
        const fd = new FormData();
        fd.append("rating", String(rating ?? ""));
        fd.append("comment", comment ?? "");
        images.forEach((uri, i) =>
          fd.append("images[]", {
            uri,
            name: `review_${Date.now()}_${i}.jpg`,
            type: "image/jpeg",
          })
        );
        return http.post(API.STORE_REVIEWS(storeId), fd); // http.post already sets content-type for FormData
      }

      return http.post(API.STORE_REVIEWS(storeId), {
        rating,
        comment,
        images: [],
      });
    },
    onSuccess: (res, vars) => {
      // Refresh the reviews list for this store
      queryClient.invalidateQueries({ queryKey: ["storeReviews", vars.storeId] });
      opts?.onSuccess?.(res, vars);
    },
    onError: (err, vars) => {
      opts?.onError?.(err, vars);
    },
  });


export const fileUrl = (p) => {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  const base = BASE_URL.replace(/\/api\/?$/, ""); // -> https://colala.hmstech.xyz

  // Handle different path types
  if (p.startsWith('profile_picture/')) {
    return `${base}/storage/${p}`;
  } else if (p.startsWith('store_reviews/')) {
    return `${base}/storage/${p}`;
  } else {
    const cleaned = String(p).replace(/^\/?storage\/?/, ""); // avoid duplicated /storage
    return `${base}/storage/${cleaned}`;
  }
};


function findChatIdForStoreInCache(queryClient, storeId) {
  const cache = queryClient.getQueryData(['chats']); // whatever key you used in useChats
  const list = cache?.data || [];
  const match = list.find(c =>
    String(c.store_id ?? c.store?.id ?? c.store_order_id ?? '') === String(storeId)
  );
  return match?.chat_id || null;
}

/**
 * useEnsureChat
 * - First checks the chats cache to see if a thread with this store already exists.
 * - If not, calls the API to create/get one, and returns the chat_id.
 *
 * Server assumptions:
 * - POST /chats { store_id } -> { status, data: { chat_id, ... } }
 *   (If your API uses another route, just swap the URL.)
 */
export const useStartChat = () => {
  return useMutation({
    mutationFn: async ({ storeId }) => {
      if (!storeId) throw new Error('storeId is required');

      // use axios instance so interceptors add Authorization
      const res = await http.post(API.START_CHAT(storeId)); // POST, no body needed for this endpoint

      // backend returns: { status, data: { id, store_id, ... }, message }
      const chatId = res?.data?.id;
      if (!chatId) throw new Error('Chat ID missing in response');
      return { chat_id: chatId, store_id: res?.data?.store_id, raw: res };
    },
  });
};




export const useMyPoints = (options) =>
  useQuery({
    queryKey: ["myPoints"],
    queryFn: () => http.get(API.My_Points),
    ...options,
  });




export const useGetPostComments = (postId, options) =>
  useQuery({
    queryKey: ["postComments", postId],
    queryFn: () => http.get(API.Get_Post_Comments(postId)),
    ...options,
  });

export const useAllBrands = (options) =>
  useQuery({
    queryKey: ["allBrands"],
    queryFn: () => http.get(API.All_Brands),
    ...options,
  });


export const useUserReview = (options) =>
  useQuery({
    queryKey: ["userReview"],
    queryFn: () => {
      const endpoint = `${BASE_URL}/user-reveiws`;
      console.log("useUserReview - Calling endpoint:", endpoint);
      return http.get(endpoint);
    },
    ...options,
  });


export const useGetTopSelling = (options) =>
  useQuery({
    queryKey: ["getTopSelling"],
    queryFn: () => http.get(API.Get_Top_Selling),
    ...options,
  });

export const useGetFaqs = (options) =>
  useQuery({
    queryKey: ["getFaqs"],
    queryFn: () => http.get(API.Get_Faqs),
    ...options,
  }); 