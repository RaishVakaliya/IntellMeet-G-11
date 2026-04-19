import { NavLink, useNavigate } from "react-router-dom";
import {
  Video, LayoutDashboard, Calendar, BarChart3,
  LogOut, Sparkles, Zap, ChevronRight, Users,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useMeetingStore } from "@/stores/meetingStore";
import ParticipantList from "../meeting/ParticipantList";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "My Dashboard", icon: LayoutDashboard },
  { to: "/MeetingRoom", label: "My Meetings", icon: Calendar },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/room/new", label: "Quick Meeting", icon: Video, badge: "Live" },
];
export function Sidebar({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void; }) {
  const { user, logout } = useAuthStore();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast("Signed out successfully");
    navigate("/auth");
  };

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  const sidebarWidth = isCollapsed ? '60px' : '220px';

  return (
    <aside className={`min-h-screen fixed left-0 top-0 flex flex-col py-5 px-3 border-r border-blue-200/50 bg-white shadow-2xl backdrop-blur-sm z-40 transition-all duration-300 w-${sidebarWidth}`} style={{ width: sidebarWidth }}>

      {/* Logo + Toggle */}
      <div className="flex items-center justify-between mb-8">
        <div className={`flex items-center gap-2.5 px-2 transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : ''}`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
            <Sparkles size={15} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-slate-900 tracking-tight">
            IntellMeet
          </span>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 transition-all text-slate-700 hover:text-blue-900"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        <p className={`text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2 transition-all ${isCollapsed ? 'opacity-0 w-0' : ''}`}>
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
                <span className={`flex-1 transition-all ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : ''}`}>{label}</span>
                {badge && !isCollapsed && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse-slow">
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Divider */}
        <div className="h-px bg-slate-200/50 my-3 mx-1" />

        {/* Pro badge */}
        <div className={`glass rounded-xl p-3 mx-1 flex items-start gap-2.5 transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : ''}`}>
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Zap size={13} className="text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900">Pro Plan</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Unlimited AI summaries</p>
          </div>
        </div>

        {/* Active Meeting Display */}
        {!isCollapsed && (
          <div className="mx-1">
            <div className="h-px bg-slate-200/50 my-4" />
            <div className="flex items-center gap-2.5 px-3 pb-2">
              <Users size={14} className="text-slate-500" />
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                Active Meeting
              </p>
            </div>
            <div className="space-y-2 mb-4">
              <ParticipantList />
            </div>
          </div>
        )}
      </nav>

      {/* User profile */}
      <div className="border-t border-slate-200/50 pt-4 mt-2 px-1">
        <div className="flex items-center gap-2.5 p-2 rounded-xl glass-hover transition-all cursor-pointer group hover:bg-blue-50/50">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`} 
              alt={user.username}
            />
            <AvatarFallback className="text-xs font-semibold text-slate-900 bg-slate-100">
              {getInitials(user.username)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.username}</p>
            <p className="text-[10px] text-slate-600 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-slate-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}