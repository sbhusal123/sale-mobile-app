import axios from 'axios';
import { storage } from '../utils/storage';

export const API_BASE_URL = 'https://deeply-oriented-imp.ngrok-free.app/api/';
export const WS_BASE_URL = 'wss://deeply-oriented-imp.ngrok-free.app/ws/chat/';
export const MEDIA_BASE_URL = 'https://deeply-oriented-imp.ngrok-free.app/media';

const USER_STORAGE_KEY = '@user_session';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Callbacks for AuthContext synchronization
export let onTokenRefreshSuccess: ((accessToken: string, refreshToken: string) => void) | null = null;
export let onTokenRefreshFailure: (() => void) | null = null;

export const setAuthCallbacks = (
  onSuccess: (acc: string, ref: string) => void,
  onFailure: () => void
) => {
  onTokenRefreshSuccess = onSuccess;
  onTokenRefreshFailure = onFailure;
};

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    if (__DEV__) {
      console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log('✅ API Response:', response.status, response.config.url);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (__DEV__) {
      console.error('❌ API Error:', {
        message: error.message,
        url: originalRequest?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized errors (Skip refresh logic if it's already a refresh or login request)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('auth/login') &&
      !originalRequest.url?.includes('auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const storedUser = await storage.getItem(USER_STORAGE_KEY);
        if (!storedUser) throw new Error('No stored session');

        const { refreshToken } = JSON.parse(storedUser);
        if (!refreshToken) throw new Error('No refresh token');

        // Request new tokens
        const response = await axios.post(`${API_BASE_URL}auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access, refresh } = response.data;

        // Update local state and persistent storage
        if (onTokenRefreshSuccess) {
          onTokenRefreshSuccess(access, refresh);
        }

        // Update Authorization header for retried and future requests
        setAuthToken(access);
        originalRequest.headers['Authorization'] = `Bearer ${access}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed (token expired, etc.)
        if (onTokenRefreshFailure) {
          onTokenRefreshFailure();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper to set auth token
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export default apiClient;

