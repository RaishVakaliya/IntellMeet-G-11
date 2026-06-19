import { create } from "zustand";
import { apiFetch } from "@/lib/apiFetch";
import type { NotificationState, NotificationType } from "@/types/notification";

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await apiFetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        const unread = data.filter((n: NotificationType) => !n.isRead).length;
        set({ notifications: data, unreadCount: unread });
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      const res = await apiFetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (res.ok) {
        const updatedNotification = await res.json();
        set((state) => {
          const updatedNotifications = state.notifications.map((n) =>
            n._id === id ? updatedNotification : n
          );
          const unread = updatedNotifications.filter((n) => !n.isRead).length;
          return { notifications: updatedNotifications, unreadCount: unread };
        });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      const res = await apiFetch("/api/notifications/read-all", {
        method: "PATCH",
      });
      if (res.ok) {
        set((state) => {
          const updatedNotifications = state.notifications.map((n) => ({
            ...n,
            isRead: true,
          }));
          return { notifications: updatedNotifications, unreadCount: 0 };
        });
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  },

  deleteNotification: async (id: string) => {
    try {
      const res = await apiFetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        set((state) => {
          const updatedNotifications = state.notifications.filter((n) => n._id !== id);
          const unread = updatedNotifications.filter((n) => !n.isRead).length;
          return { notifications: updatedNotifications, unreadCount: unread };
        });
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  },

  addNotification: (notification: NotificationType) => {
    set((state) => {
      if (state.notifications.some((n) => n._id === notification._id)) {
        return {};
      }
      const updatedNotifications = [notification, ...state.notifications];
      const unread = updatedNotifications.filter((n) => !n.isRead).length;
      return { notifications: updatedNotifications, unreadCount: unread };
    });
  },
}));
