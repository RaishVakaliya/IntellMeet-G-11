import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { clearAuth, getToken, logout } from "../utils/auth";

type UserProfile = {
  username: string;
  email: string;
};

const Homepage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      const accessToken = getToken();
      if (!accessToken) {
        navigate("/auth/signin", { replace: true });
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/auth/profile`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error("Session expired, please sign in again");
        }

        const data = await response.json();
        const profile: UserProfile = {
          username: data.name || data.username || "User",
          email: data.email || "",
        };

        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
      } catch (error) {
        clearAuth();
        toast.error(error instanceof Error ? error.message : "Please sign in");
        navigate("/auth/signin", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate]);

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center">Loading...</div>;
  }

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/auth/signin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            Logout
          </button>
        </div>
        <div className="space-y-3 text-slate-700">
          <p>
            <span className="font-semibold">Username:</span> {user.username}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {user.email}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
