import { create } from "zustand";

const initialState = {
  user: null,
  isAuthenticated: false,
  isAuthReady: false,
};

export const useAuthStore = create((set) => ({
  ...initialState,

  setUser: (user) => {
    set({
      user,
      isAuthenticated: Boolean(user),
      isAuthReady: true,
    });
  },

  clearUser: () => {
    set({
      user: null,
      isAuthenticated: false,
      isAuthReady: true,
    });
  },

  markAuthReady: () => {
    set({
      isAuthReady: true,
    });
  },

  resetAuth: () => {
    set(initialState);
  },
}));