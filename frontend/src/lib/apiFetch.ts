import { useAuthStore } from "@/stores/authStore";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const store = useAuthStore.getState();
  const token = store.accessToken;
  const isFormDataBody =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const makeRequest = (t: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(isFormDataBody ? {} : { "Content-Type": "application/json" }),
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

export async function handleJsonResponse<T = any>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type");
  const isJson = Boolean(
    contentType && contentType.includes("application/json"),
  );

  if (!res.ok) {
    let errorMessage = `Request failed with status ${res.status}`;
    let activeCode: string | undefined;

    if (isJson) {
      try {
        const errData = await res.json();
        if (errData.message) errorMessage = errData.message;
        if (errData.activeCode) activeCode = errData.activeCode;
      } catch {}
    } else {
      try {
        const text = await res.text();
        if (text && text.length < 150 && !text.includes("<")) {
          errorMessage = text;
        }
      } catch {}
    }

    const error = new Error(errorMessage) as Error & {
      status?: number;
      activeCode?: string;
    };
    error.status = res.status;
    if (activeCode) error.activeCode = activeCode;
    throw error;
  }

  if (!isJson) {
    const text = await res.text().catch(() => "");
    if (!text.trim()) {
      return {} as T;
    }
    throw new Error(
      `Expected JSON from server, but received non-JSON response (${res.status})`,
    );
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw new Error("Failed to parse JSON response from server");
  }
}
