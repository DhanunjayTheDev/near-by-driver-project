import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Auth
export const sendOtp = (phone) => api.post('/auth/user/send-otp', { phone });
export const verifyOtp = (phone, otp) => api.post('/auth/user/verify-otp', { phone, otp });

// User Profile
export const getProfile = () => api.get('/user/profile');
export const updateProfile = (formData) =>
  api.put('/user/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateFcmToken = (fcm_token) => api.put('/user/fcm-token', { fcm_token });

// Notifications
export const getNotifications = (page = 1, limit = 20) =>
  api.get(`/user/notifications?page=${page}&limit=${limit}`);
export const markNotificationRead = (id) => api.put(`/user/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/user/notifications/read-all');

// Support
export const createSupportTicket = (data) => api.post('/user/support-tickets', data);
export const getSupportTickets = () => api.get('/user/support-tickets');

// Rides
export const requestRide = (data) => api.post('/ride/request', data);
export const cancelRide = (rideId, reason) => api.post(`/ride/${rideId}/cancel`, { reason });
export const payForRide = (rideId, data) => api.post(`/ride/${rideId}/pay`, data);
export const rateRide = (rideId, data) => api.post(`/ride/${rideId}/rate`, data);
export const getRideDetails = (rideId) => api.get(`/ride/${rideId}`);
export const getRideHistory = (page = 1, limit = 20) =>
  api.get(`/ride/user/history?page=${page}&limit=${limit}`);
export const getRideStatusLogs = (rideId) => api.get(`/ride/${rideId}/logs`);
export const getNearbyDrivers = (longitude, latitude, vehicle_type) =>
  api.get(`/ride/nearby-drivers?longitude=${longitude}&latitude=${latitude}&vehicle_type=${vehicle_type}`);
export const getFareEstimate = (vehicle_type, distance, duration) =>
  api.get(`/ride/fare-estimate?vehicle_type=${vehicle_type}&distance=${distance}&duration=${duration}`);

export default api;
