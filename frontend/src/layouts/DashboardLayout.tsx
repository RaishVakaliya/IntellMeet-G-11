import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { ToastContainer } from "@/components/ui/Toast";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[220px] flex flex-col min-h-screen">
        <Navbar title={title} />
        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
