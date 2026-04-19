import { NavLink, useNavigate } from "react-router-dom";
import {
  Video, LayoutDashboard, Calendar, BarChart3,
  LogOut, Sparkles, Zap, ChevronRight, Users,
  User, Settings, HelpCircle, ChevronUp,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useMeetingStore } from "@/stores/meetingStore";
import ParticipantList from "../meeting/ParticipantList";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "My Dashboard", icon: LayoutDashboard },
  { to: "/MeetingRoom", label: "My Meetings", icon: Calendar },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/room/new", label: "Quick Meeting", icon: Video, badge: "Live" },
];

const PROFILE_MENU_ITEMS = [
  { label: "Edit Profile", path: "/profile/edit", icon: User, action: "edit-profile" },
  { label: "Settings", path: "/settings", icon: Settings, action: "settings" },
  { label: "Help & Support", path: "/help", icon: HelpCircle, action: "help" },
];
export function Sidebar({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    toast("Signed out successfully");
    navigate("/auth");
  };

  const handleProfileAction = (action: string) => {
    setProfileMenuOpen(false);
    switch (action) {
      case "edit-profile":
        navigate("/profile/edit");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "help":
        navigate("/help");
        break;
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (username: string) =>
    username.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  if (!user) return null;

  const sidebarWidth = isCollapsed ? "60px" : "220px";

  return (
    <aside
      className="min-h-screen fixed left-0 top-0 flex flex-col py-5 px-3 border-r border-blue-200/50 bg-white shadow-2xl backdrop-blur-sm z-40 transition-all duration-300"
      style={{ width: sidebarWidth }}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between mb-8">
        <div className={`flex items-center gap-2.5 px-2 transition-all duration-300 ${isCollapsed ? "opacity-0 w-0" : ""}`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
            <Sparkles size={15} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-slate-900 tracking-tight">IntellMeet</span>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 transition-all text-slate-700 hover:text-blue-900"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        <p className={`text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2 transition-all ${isCollapsed ? "opacity-0 w-0" : ""}`}>
          Navigation
        </p>
        {NAV_ITEMS.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-blue-500/20 text-blue-700 border border-blue-500/30"
                  : "text-slate-700 hover:text-blue-800 hover:bg-blue-50/50"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  className={cn(
                    "flex-shrink-0 transition-colors",
                    isActive ? "text-blue-600" : "text-slate-600 group-hover:text-blue-700"
                  )}
                />
                <span className={`flex-1 transition-all ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : ""}`}>{label}</span>
                {badge && !isCollapsed && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse-slow">
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        <div className="h-px bg-slate-200/50 my-3 mx-1" />

        <div className={`glass rounded-xl p-3 mx-1 flex items-start gap-2.5 transition-all duration-300 ${isCollapsed ? "opacity-0 w-0" : ""}`}>
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Zap size={13} className="text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900">Pro Plan</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Unlimited AI summaries</p>
          </div>
        </div>

        {!isCollapsed && (
          <div className="mx-1">
            <div className="h-px bg-slate-200/50 my-4" />
            <div className="flex items-center gap-2.5 px-3 pb-2">
              <Users size={14} className="text-slate-500" />
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Active Meeting</p>
            </div>
            <div className="space-y-2 mb-4">
              <ParticipantList />
            </div>
          </div>
        )}
      </nav>

      {/* User profile with popup menu */}
      <div className="border-t border-slate-200/50 pt-4 mt-2 px-1 relative" ref={profileRef}>
        {/* Profile Options Popup Menu */}
        {profileMenuOpen && !isCollapsed && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
            <div className="p-1.5">
              {PROFILE_MENU_ITEMS.map(({ label, icon: Icon, action }) => (
                <button
                  key={action}
                  onClick={() => handleProfileAction(action)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <Icon size={14} className="text-slate-500" />
                  {label}
                </button>
              ))}
              <div className="h-px bg-slate-100 my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* Profile Row */}
        <button
          onClick={() => setProfileMenuOpen((prev) => !prev)}
          className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-blue-50/50 transition-all group"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`}
              alt={user.username}
            />
            <AvatarFallback className="text-xs font-semibold text-slate-900 bg-slate-100">
              {getInitials(user.username)}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.username}</p>
                <p className="text-[10px] text-slate-600 truncate">{user.email}</p>
              </div>
              <ChevronUp
                size={14}
                className={cn(
                  "text-slate-400 transition-transform duration-200",
                  profileMenuOpen ? "rotate-180" : "rotate-0"
                )}
              />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}