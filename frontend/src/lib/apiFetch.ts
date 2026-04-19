import { useAuthStore } from "@/stores/authStore";

const API_BASE = import.meta.env.MODE === 'development' ? '' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');
  // Uses Vite proxy /api -> localhost:5000 in dev (relative paths), absolute in prod

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const store = useAuthStore.getState();
  const token = store.accessToken;

  const makeRequest = (t: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
    });

  let res = await makeRequest(token);

  if (res.status === 401) {
    const newToken = await store.refreshAccessToken();
    if (newToken) {
      res = await makeRequest(newToken);
    }
  }

  return res;
}
