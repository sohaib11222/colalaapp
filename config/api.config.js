// api.config.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";

export const BASE_URL = "https://colala.hmstech.xyz/api";

const API = {
  // Auth
  REGISTER: `${BASE_URL}/auth/register`,
  // (add more as they come, e.g.)
  LOGIN: `${BASE_URL}/auth/login`,
  FORGOT_PASSWORD: `${BASE_URL}/auth/forget-password`,
  RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
  VERIFY_OTP: `${BASE_URL}/auth/verify-otp`,


  // FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,

  CATEGORIES: `${BASE_URL}/categories`,

  POSTS: `${BASE_URL}/posts`,

  POST_LIKE: (postId) => `${BASE_URL}/posts/${postId}/like`,
  POST_COMMENTS: (postId) => `${BASE_URL}/posts/${postId}/comments`,

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
    config.headers = {
      ...(config.headers || {}),
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (r) => r,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const message =
      data?.message || error?.message || "Something went wrong. Please try again.";
    return Promise.reject({ status, data, message });
  }
);

// ---- Tiny HTTP helper (unwraps response.data)
// api.config.js (only the http.post changed)
export const http = {
  get: (url, params, config) =>                      // <-- add
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
    mutationFn: (payload) => http.post(API.FORGOT_PASSWORD, payload),
    ...opts,
  });

export const useVerifyOtp = (opts) =>
  useMutation({
    // expects: { email, code }
    mutationFn: (payload) => http.post(API.VERIFY_OTP, payload),
    ...opts,
  });

  export const useResetPassword = (opts) =>
  useMutation({
    mutationFn: (payload) => http.post(API.RESET_PASSWORD, payload),
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
