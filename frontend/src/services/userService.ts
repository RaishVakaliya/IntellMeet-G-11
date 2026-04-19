import { apiFetch } from '../lib/apiFetch';
import type { User } from '../types/auth';

export interface UpdateProfileData {
  username?: string;
  email?: string;
  avatarUrl?: string;
}

export const getProfile = async (): Promise<User> => {
  const response = await apiFetch('/api/auth/profile');
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  return response.json();
};

export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  const response = await apiFetch('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update profile');
  }
  return response.json();
};

// Mock avatar upload (backend stub)
export const uploadAvatar = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await apiFetch('/api/auth/avatar-upload', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to upload avatar');
  }
  const { url } = await response.json();
  return url;
};
