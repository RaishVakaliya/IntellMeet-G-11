export interface User {
  _id: string;
  username: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => Promise<void>;
  hydrateAuth: () => void;
  refreshAccessToken: () => Promise<string | null>;
}
