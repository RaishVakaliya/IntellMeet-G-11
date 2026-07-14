import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AppLogoImg from "@/assets/AppLogo.png";
import {
  LayoutDashboard,
  Video,
  Bell,
  Trash2,
  MessageSquare,
  ClipboardList,
} from "lucide-react";
import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useNotificationStore } from "@/stores/notificationStore";
import type { NotificationType } from "@/types/notification";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const formatRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString();
};

export const AppNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const socket = useSocket();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: NotificationType) => {
      addNotification(notification);
      toast.info(notification.title, {
        description: notification.message,
        duration: 5000,
      });
    };

    socket.on("new-notification", handleNewNotification);
    return () => {
      socket.off("new-notification", handleNewNotification);
    };
  }, [socket, addNotification]);

  if (!user) return null;

  const navLinks = [
    {
      label: "Meetings",
      path: "/dashboard",
      icon: Video,
      active: location.pathname === "/dashboard",
    },
    {
      label: "Board",
      path: "/board",
      icon: LayoutDashboard,
      active: location.pathname.startsWith("/board"),
    },
  ];

  return (
    <>
      <nav className="h-16 border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-5">
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
              onClick={() => navigate("/dashboard")}
            >
              <img
                src={AppLogoImg}
                alt="IntellMeet"
                className="h-18 w-auto object-contain"
              />
            </div>

            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map(({ label, path, icon: Icon, active }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label={
                    unreadCount > 0
                      ? `Notifications, ${unreadCount} unread`
                      : "Notifications"
                  }
                  className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors cursor-pointer outline-hidden shrink-0"
                >
                  <Bell className="w-5 h-5" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span
                      aria-live="polite"
                      className="absolute top-1 right-1 w-4 h-4 bg-destructive text-[9px] font-bold text-destructive-foreground rounded-full flex items-center justify-center animate-pulse"
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-80 sm:w-96 right-0 mt-2 bg-popover text-popover-foreground border border-border shadow-2xl rounded-2xl p-0 flex flex-col overflow-hidden"
                align="end"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40 shrink-0">
                  <span className="text-sm font-bold text-foreground">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                      className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <ScrollArea className="h-[350px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-3">
                        <Bell className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        All caught up!
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        You have no new notifications.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col divide-y divide-border">
                      {notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => {
                            if (!n.isRead) markAsRead(n._id);
                            if (n.relatedMeeting?.meetingCode) {
                              navigate(`/room/${n.relatedMeeting.meetingCode}`);
                            }
                          }}
                          className={`flex items-start gap-3 p-4 hover:bg-muted/40 transition-colors cursor-pointer relative group ${
                            !n.isRead ? "bg-primary/5" : ""
                          }`}
                        >
                          <div
                            className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                              n.type === "mention"
                                ? "bg-blue-500/10 text-blue-500"
                                : "bg-amber-500/10 text-amber-500"
                            }`}
                          >
                            {n.type === "mention" ? (
                              <MessageSquare className="w-4 h-4" />
                            ) : (
                              <ClipboardList className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={`text-xs truncate ${!n.isRead ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}
                              >
                                {n.title}
                              </p>
                              <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                                {formatRelativeTime(n.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                          </div>

                          <div
                            className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(n._id);
                              }}
                              className="p-1 hover:bg-muted text-muted-foreground hover:text-destructive rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {!n.isRead && (
                            <span className="absolute right-3 bottom-4 w-2.5 h-2.5 bg-primary rounded-full shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 rounded-full hover:bg-muted pl-1 pr-3 py-1 transition-colors outline-hidden border border-transparent hover:border-border/50 cursor-pointer shrink-0"
            >
              <Avatar className="w-8 h-8 border border-border">
                {user.avatar && (
                  <AvatarImage src={user.avatar} alt={user.username} />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {getInitials(user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left mr-1">
                <p className="text-xs font-bold text-foreground leading-none">
                  {user.username.split(" ")[0]}
                </p>
              </div>
            </button>
          </div>
        </div>
      </nav>

      <div className="fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-md border-t border-border z-50 flex items-center justify-around sm:hidden px-6 pb-safe shadow-lg">
        {navLinks.map(({ label, path, icon: Icon, active }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl transition-all cursor-pointer ${
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-semibold">{label}</span>
          </button>
        ))}
      </div>
    </>
  );
};
