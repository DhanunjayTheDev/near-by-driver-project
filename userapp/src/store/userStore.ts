import {create} from 'zustand';

interface UserState {
  name: string;
  email: string;
  phone: string;
  profileImage: string;

  setProfile: (data: Partial<UserState>) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>(set => ({
  name: '',
  email: '',
  phone: '',
  profileImage: '',

  setProfile: data => set(state => ({...state, ...data})),
  clearProfile: () =>
    set({name: '', email: '', phone: '', profileImage: ''}),
}));
