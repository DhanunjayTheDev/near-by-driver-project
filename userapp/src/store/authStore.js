import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { sendOtp, verifyOtp, getProfile } from '../services/apiService';
import socketService from '../services/socketService';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  otpSent: false,
  phone: '',

  setPhone: (phone) => set({ phone }),

  sendOtp: async (phone) => {
    await sendOtp(phone);
    set({ phone, otpSent: true });
  },

  verifyOtp: async (otp) => {
    const { phone } = get();
    const data = await verifyOtp(phone, otp);
    await SecureStore.setItemAsync('userToken', data.token);
    await socketService.connect();
    set({
      token: data.token,
      user: data.user,
      isAuthenticated: true,
      otpSent: false,
    });
    return data;
  },

  loadUser: async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      set({ token });
      const data = await getProfile();
      await socketService.connect();
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      await SecureStore.deleteItemAsync('userToken');
      set({ isLoading: false, isAuthenticated: false, token: null, user: null });
    }
  },

  updateUser: (user) => set({ user }),

  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
    socketService.disconnect();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      otpSent: false,
      phone: '',
    });
  },
}));

export default useAuthStore;
