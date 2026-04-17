import { NavLink, useNavigate } from "react-router-dom";
import {
  Home, Video, LayoutDashboard, Columns3,
  LogOut, ChevronRight, Sparkles, Zap,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/lobby", label: "Meeting Lobby", icon: Home },
  { to: "/room", label: "Meeting Room", icon: Video, badge: "Live" },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/kanban", label: "Kanban Board", icon: Columns3 },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast("Signed out successfully");
    navigate("/auth");
  };

  return (
    <aside className="w-[220px] min-h-screen fixed left-0 top-0 flex flex-col py-5 px-3 border-r border-white/[0.07] bg-[#080e1a]/90 backdrop-blur-xl z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="w-8 h-8 rounded-xl btn-gradient flex items-center justify-center flex-shrink-0">
          <Sparkles size={15} className="text-white" />
        </div>
        <span className="font-display font-bold text-lg text-white tracking-tight">
          IntellMeet
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">
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
                  ? "bg-teal-500/15 text-teal-300 border border-teal-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  className={cn(
                    "flex-shrink-0 transition-colors",
                    isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"
                  )}
                />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse-slow">
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Divider */}
        <div className="h-px bg-white/[0.06] my-3 mx-1" />

        {/* Pro badge */}
        <div className="glass rounded-xl p-3 mx-1 flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Zap size={13} className="text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">Pro Plan</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Unlimited AI summaries</p>
          </div>
        </div>
      </nav>

      {/* User profile */}
      <div className="border-t border-white/[0.07] pt-4 mt-2 px-1">
        <div className="flex items-center gap-2.5 p-2 rounded-xl glass-hover transition-all cursor-pointer group">
          <Avatar user={user!} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-slate-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
