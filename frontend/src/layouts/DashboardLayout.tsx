import { Sidebar } from "./Sidebar";
import { AppNavbar } from "./AppNavbar";

import { useState } from "react";

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

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const sidebarWidth = isCollapsed ? '60px' : '220px';

  const mainMlClass = `transition-all duration-300 ${isCollapsed ? 'ml-0' : 'ml-[220px]'}`;

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

