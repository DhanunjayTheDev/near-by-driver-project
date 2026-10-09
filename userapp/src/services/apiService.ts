import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE_URL} from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  },
);

// Auth
export const sendOtp = (phone: string) =>
  api.post('/auth/user/send-otp', {phone});

export const verifyOtp = (phone: string, otp: string) =>
  api.post('/auth/user/verify-otp', {phone, otp});

// User
export const getUserProfile = () => api.get('/user/profile');

export const updateUserProfile = (formData: FormData) =>
  api.put('/user/profile', formData, {
    headers: {'Content-Type': 'multipart/form-data'},
  });

export const updateFcmToken = (fcm_token: string) =>
  api.put('/user/fcm-token', {fcm_token});

// Notifications
export const getNotifications = (page = 1, limit = 20) =>
  api.get(`/user/notifications?page=${page}&limit=${limit}`);

export const markNotificationRead = (id: string) =>
  api.put(`/user/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  api.put('/user/notifications/read-all');

// Ride
export const requestRide = (data: {
  pickup_location: {coordinates: [number, number]; address: string};
  drop_location: {coordinates: [number, number]; address: string};
  city_id: string;
  estimated_distance: number;
  estimated_duration: number;
  vehicle_type: string;
}) => api.post('/ride/request', data);

export const getNearbyDrivers = (
  longitude: number,
  latitude: number,
  vehicle_type: string,
) =>
  api.get(
    `/ride/nearby-drivers?longitude=${longitude}&latitude=${latitude}&vehicle_type=${vehicle_type}`,
  );

export const getFareEstimate = (
  vehicle_type: string,
  distance: number,
  duration: number,
) =>
  api.get(
    `/ride/fare-estimate?vehicle_type=${vehicle_type}&distance=${distance}&duration=${duration}`,
  );

export const cancelRide = (rideId: string, reason: string) =>
  api.post(`/ride/${rideId}/cancel`, {reason});

export const payForRide = (
  rideId: string,
  payment_method: string,
  transaction_id?: string,
) =>
  api.post(`/ride/${rideId}/pay`, {payment_method, transaction_id});

export const rateRide = (rideId: string, rating: number, review?: string) =>
  api.post(`/ride/${rideId}/rate`, {rating, review});

export const getRideHistory = (page = 1, limit = 20) =>
  api.get(`/ride/user/history?page=${page}&limit=${limit}`);

export const getRideDetails = (rideId: string) => api.get(`/ride/${rideId}`);

export const getRideLogs = (rideId: string) =>
  api.get(`/ride/${rideId}/logs`);

// Support
export const createSupportTicket = (data: {
  ride_id?: string;
  issue_type: string;
  description: string;
}) => api.post('/user/support-tickets', data);

export const getSupportTickets = () => api.get('/user/support-tickets');

export default api;
