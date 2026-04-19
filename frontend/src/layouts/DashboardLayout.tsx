import { Sidebar } from "./Sidebar";
import { AppNavbar } from "./AppNavbar";
import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/services/userService';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}
interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}
export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout, setAuth, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const { data: userProfile, isLoading: profileLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: isAuthenticated,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (error && !profileLoading) {
      console.warn('Profile fetch failed, logging out:', error);
      logout();
      navigate('/auth/signin', { replace: true });
    }
  }, [error, profileLoading, logout, navigate]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const sidebarWidth = isCollapsed ? '60px' : '220px';
  const mainMlClass = `transition-all duration-300 ${isCollapsed ? 'ml-0' : 'ml-[220px]'}`;

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      <div className={`flex-1 ${mainMlClass} flex flex-col min-h-screen`}>
        <AppNavbar />
        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

