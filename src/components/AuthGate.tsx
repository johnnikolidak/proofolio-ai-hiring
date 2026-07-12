import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth, type ProfileRole } from "@/hooks/use-auth";
import { dashboardPathFor } from "@/hooks/use-guest";

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
      navigate({ to: dashboardPathFor({ role: profile?.role }) });
      return;
    }
    if (requiredRole && requiredRole !== "admin" && profile && profile.role !== requiredRole && !isAdmin) {
      navigate({ to: dashboardPathFor({ role: profile.role }) });
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
