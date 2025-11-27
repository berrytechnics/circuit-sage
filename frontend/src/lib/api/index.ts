import axios, { AxiosError, AxiosRequestConfig } from "axios";

// Get base URL and ensure it ends with /api
const getBaseURL = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
  // Remove trailing slash if present
  const baseUrl = envUrl.replace(/\/$/, "");
  // Ensure /api is included
  return baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
};

// Create axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interface
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    errors?: Record<string, string>;
  };
}

// Types for auth
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Token management
let accessToken: string | null = null;

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from variable or localStorage (in case it was updated elsewhere)
    const token = accessToken || (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);
    // Add auth token to headers if available
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 or 403 (unauthorized/forbidden), token is invalid or expired
    // Since there's no refresh endpoint yet, redirect to login (but not if already on login page)
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // Logout
      logout();
      
      // Redirect to login page if we're in the browser and not already on login/register pages
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (currentPath !== "/login" && currentPath !== "/register") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth functions
export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>(
    "/auth/login",
    credentials
  );

  if (response.data.success && response.data.data) {
    const { accessToken: token, refreshToken } = response.data.data;
    accessToken = token;
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refreshToken);
    return response.data.data;
  }

  throw new Error(response.data.error?.message || "Login failed");
};

export const register = async (
  userData: LoginCredentials & {
    firstName: string;
    lastName: string;
    role?: string;
  }
): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>(
    "/auth/register",
    userData
  );

  if (response.data.success && response.data.data) {
    const { accessToken: token, refreshToken } = response.data.data;
    accessToken = token;
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refreshToken);
    return response.data.data;
  }

  throw new Error(response.data.error?.message || "Registration failed");
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<ApiResponse<User>>("/auth/me");

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.error?.message || "Failed to get user");
};

export const logout = (): void => {
  accessToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
};

// User/Technician API functions
export type Technician = User & {
  // Additional technician-specific fields could be added here
};

export const getTechnicians = async (): Promise<ApiResponse<Technician[]>> => {
  const response = await api.get<ApiResponse<Technician[]>>(
    "/users/technicians"
  );

  if (response.data.success) {
    return response.data;
  }

  throw new Error(
    response.data.error?.message || "Failed to fetch technicians"
  );
};

// Set token from storage on init
if (typeof window !== "undefined") {
  const savedToken = localStorage.getItem("accessToken");
  if (savedToken) {
    accessToken = savedToken;
  }
}

export default api;
