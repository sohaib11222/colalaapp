// api.config.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, useMutation } from "@tanstack/react-query";

export const BASE_URL = "https://colala.hmstech.xyz/api";

const API = {
  // Auth
  REGISTER: `${BASE_URL}/auth/register`,
  // (add more as they come, e.g.)
    LOGIN: `${BASE_URL}/auth/login`,
  // FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
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

export const setAuthUser    = async (user)  => AsyncStorage.setItem("auth_user", JSON.stringify(user));


// Optional token helpers for when you add login
export const setAuthToken = async (token) =>
  AsyncStorage.setItem("auth_token", token);
export const clearAuthToken = async () => AsyncStorage.removeItem("auth_token");
export const getAuthToken = async () => AsyncStorage.getItem("auth_token");
