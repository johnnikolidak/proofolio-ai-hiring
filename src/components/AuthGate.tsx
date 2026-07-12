import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth, type ProfileRole } from "@/hooks/use-auth";

/**
 * Client-side guard for authenticated dashboards.
 * Redirects unauthenticated users to /auth/login and role-mismatched users to their own dashboard.
 */
export function AuthGate({ children, requiredRole }: { children: ReactNode; requiredRole?: ProfileRole }) {
  const { loading, session, profile, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/auth/login" });
      return;
    }
    if (requiredRole === "admin" && !isAdmin) {
      navigate({ to: profile?.role === "company" ? "/company" : "/candidate" });
      return;
    }
    if (requiredRole && requiredRole !== "admin" && profile && profile.role !== requiredRole && !isAdmin) {
      navigate({ to: profile.role === "company" ? "/company" : "/candidate" });
    }
  }, [loading, session, profile, isAdmin, requiredRole, navigate]);

  if (loading || !session || (requiredRole === "admin" && !isAdmin)) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  return <>{children}</>;
}
