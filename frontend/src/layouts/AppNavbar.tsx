import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { getMyMeetings } from "@/services/meetingService";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut } from "lucide-react";
import { toast } from "sonner";
import AppLogoImg from "@/assets/AppLogo.png";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export const AppNavbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isCheckingLogout, setIsCheckingLogout] = useState(false);

  const handleLogout = async () => {
    setIsCheckingLogout(true);
    try {
      await logout();
      navigate("/auth/signin", { replace: true });
    } catch {
      toast.error("Logout failed. Clearing local data.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setIsCheckingLogout(false);
      navigate("/auth/signin", { replace: true });
    }
  };

  if (!user) return null;

  return (
    <nav className="h-16 border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => navigate("/dashboard")}
        >
          <img
            src={AppLogoImg}
            alt="IntellMeet"
            className="h-18 w-auto object-contain"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full hover:bg-muted pl-1 pr-3 py-1 transition-colors outline-hidden">
              <Avatar className="w-8 h-8 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {getInitials(user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left mr-1">
                <p className="text-xs font-bold text-foreground leading-none">
                  {user.username.split(" ")[0]}
                </p>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 p-2 bg-card border border-border shadow-xl rounded-2xl"
          >
            <DropdownMenuLabel className="font-normal px-2 py-3">
              <div className="flex flex-col gap-0.5">
                <p className="font-bold text-foreground text-sm">
                  {user.username}
                </p>
                <p className="text-xs text-muted-foreground truncate font-medium">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isCheckingLogout}
              className="mt-1 text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 cursor-pointer py-2.5 rounded-xl font-semibold text-xs"
            >
              <LogOut className="w-4 h-4" />
              {isCheckingLogout ? "Checking..." : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};
