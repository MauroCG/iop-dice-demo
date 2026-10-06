import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor for logging & auth tokens
apiClient.interceptors.request.use(
  (config) => {
    // Ready for Open Payments GNAP grant access token attachment
    const activeToken = localStorage.getItem('ilp_access_token') || localStorage.getItem('ilp_grant_token');
    if (activeToken && !activeToken.startsWith('grant_') && config.headers) {
      config.headers.Authorization = `GNAP ${activeToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified response handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Standard error formatting
    const customMessage = error.response?.data?.message || error.message || 'Error de red';
    return Promise.reject(new Error(customMessage));
  }
);

// Helper for simulated latency in mock mode
export async function simulateNetworkDelay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
