import { create } from "zustand";

const readAuthFromStorage = (storage) => {
  const user = storage.getItem("user");
  const accessToken = storage.getItem("accessToken");
  const refreshToken = storage.getItem("refreshToken");
  if (!accessToken || !refreshToken || !user) return null;
  return {
    user: JSON.parse(user),
    accessToken,
    refreshToken,
  };
};

const getInitial = () => {
  const persisted = readAuthFromStorage(localStorage) || readAuthFromStorage(sessionStorage);
  const isAuthenticated = Boolean(persisted?.accessToken);
  
  return {
    user: persisted?.user || null,
    accessToken: persisted?.accessToken || null,
    refreshToken: persisted?.refreshToken || null,
    isAuthenticated,
    isHydrated: true, // Mark as hydrated after initial state is loaded
  };
};

export const useAuthStore = create((set, get) => ({
  ...getInitial(),
  isHydrated: false,
  login: (user, tokens, options = {}) => {
    const rememberMe = Boolean(options.rememberMe);
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    otherStorage.removeItem("user");
    otherStorage.removeItem("accessToken");
    otherStorage.removeItem("refreshToken");
    
    storage.setItem("user", JSON.stringify(user));
    storage.setItem("accessToken", tokens.accessToken);
    storage.setItem("refreshToken", tokens.refreshToken);
    
    set({ user, ...tokens, isAuthenticated: true, isHydrated: true });
  },
  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },
  updateUser: (user) => {
    if (localStorage.getItem("accessToken")) localStorage.setItem("user", JSON.stringify(user));
    if (sessionStorage.getItem("accessToken")) sessionStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },
}));
