import { apiFetch, handleJsonResponse } from "@/lib/apiFetch";
import { useAuthStore } from "@/stores/authStore";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const updateUsername = async (username: string): Promise<void> => {
  const res = await apiFetch("/api/auth/profile", {
    method: "PATCH",
    body: JSON.stringify({ username }),
  });
  const data = await handleJsonResponse<{ username: string }>(res);
  useAuthStore.getState().updateUser({ username: data.username });
};

export const getAllUsers = async () => {
  const res = await apiFetch("/api/users");
  return handleJsonResponse(res);
};

export const uploadAvatar = async (
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> => {
  const store = useAuthStore.getState();
  let token = store.accessToken;

  const formData = new FormData();
  formData.append("avatar", file);

  const xhrRequest = (t: string | null): Promise<{ avatar: string }> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE}/api/auth/avatar-upload`);
      xhr.withCredentials = true;

      if (t) xhr.setRequestHeader("Authorization", `Bearer ${t}`);

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            reject({ status: xhr.status, message: "Invalid JSON response" });
          }
        } else {
          reject({ status: xhr.status, response: xhr.responseText });
        }
      };

      xhr.onerror = () =>
        reject({ status: xhr.status, message: "Network error" });
      xhr.send(formData);
    });
  };

  try {
    let data;
    try {
      data = await xhrRequest(token);
    } catch (err: unknown) {
      const error = err as {
        status?: number;
        response?: string;
        message?: string;
      };
      if (error.status === 401) {
        const newToken = await store.refreshAccessToken();
        if (newToken) {
          data = await xhrRequest(newToken);
        } else {
          throw new Error("Session expired. Please login again.");
        }
      } else {
        let msg = "Failed to upload avatar";
        if (error.response) {
          try {
            const parsed = JSON.parse(error.response);
            if (parsed.message) msg = parsed.message;
          } catch {}
        }
        throw new Error(msg);
      }
    }

    useAuthStore.getState().updateUser({ avatar: data.avatar });
    return data.avatar;
  } catch (error: unknown) {
    throw error;
  }
};
