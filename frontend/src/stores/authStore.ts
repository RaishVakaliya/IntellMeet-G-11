import { create } from "zustand";
import type { AuthState } from "@/types/auth";
import { getProfile } from "@/services/userService";

const API_BASE = (import.meta.env as any).DEV ? '' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const profile = await getProfile();
      const updatedUser = { ...user, ...profile };
      set({ user: updatedUser });
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.warn("Failed to fetch profile:", error);
    }
  },

  setAuth: async (user, token) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, accessToken: token, isAuthenticated: true });
    await get().fetchProfile();
  },

  refreshAccessToken: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        get().logout();
        return null;
      }
      const { accessToken } = await res.json();
      const user = get().user;
      if (user) {
        localStorage.setItem("accessToken", accessToken);
        set({ accessToken, isAuthenticated: true });
      }
      return accessToken as string;
    } catch {
      return null;
    }
  },

  logout: async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore network errors during logout
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  hydrateAuth: async () => {
    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, accessToken: token, isAuthenticated: true });
        await get().fetchProfile();
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    }
  },
}));

