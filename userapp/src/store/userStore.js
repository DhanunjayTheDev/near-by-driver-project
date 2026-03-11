import { create } from 'zustand';
import { getProfile, updateProfile } from '../services/apiService';

const useUserStore = create((set) => ({
  profile: null,
  isLoading: false,

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const data = await getProfile();
      set({ profile: data.user, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateProfile: async (formData) => {
    const data = await updateProfile(formData);
    set({ profile: data.user });
    return data;
  },
}));

export default useUserStore;
