export interface NotificationType {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  type: "mention" | "action_item";
  title: string;
  message: string;
  relatedMeeting?: {
    _id: string;
    title: string;
    meetingCode: string;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationState {
  notifications: NotificationType[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: NotificationType) => void;
}
