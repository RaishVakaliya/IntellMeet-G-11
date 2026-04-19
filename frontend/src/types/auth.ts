export interface User {
  _id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  fetchProfile: () => Promise<void>;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrateAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}
