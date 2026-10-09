import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {sendOtp, verifyOtp, getUserProfile} from '../services/apiService';

interface User {
  _id: string;
  phone: string;
  name: string;
  email: string;
  profile_image: string;
  status: string;
  default_payment_method: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  otpSent: boolean;

  initialize: () => Promise<void>;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  otpSent: false,

  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        set({token, isAuthenticated: true});
        await get().fetchProfile();
      }
    } catch {
      // Token invalid or expired
      await AsyncStorage.removeItem('auth_token');
    } finally {
      set({isLoading: false});
    }
  },

  requestOtp: async (phone: string) => {
    await sendOtp(phone);
    set({otpSent: true});
  },

  verifyOtp: async (phone: string, otp: string) => {
    const response = await verifyOtp(phone, otp);
    const {token, user} = response.data;
    await AsyncStorage.setItem('auth_token', token);
    set({token, user, isAuthenticated: true, otpSent: false});
  },

  fetchProfile: async () => {
    try {
      const response = await getUserProfile();
      set({user: response.data.user || response.data});
    } catch {
      // Profile fetch failed
    }
  },

  setUser: (user: User) => set({user}),

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      otpSent: false,
    });
  },
}));
