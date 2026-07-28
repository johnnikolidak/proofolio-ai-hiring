import { useEffect, useRef, type ReactNode } from "react";
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
      navigate({ to: dashboardPathFor({ role: profile?.role, completionPct: profile?.completion_pct }) });
      return;
    }
    if (requiredRole && requiredRole !== "admin" && profile && profile.role !== requiredRole && !isAdmin) {
      navigate({ to: dashboardPathFor({ role: profile.role, completionPct: profile.completion_pct }) });
    }
  }, [loading, session, profile, isAdmin, requiredRole, navigate]);

  // Gate candidates into the onboarding wizard until their profile is complete. The redirect fires
  // once per fresh entry into this section (ref), but the render gate below always holds children
  // back while incomplete — this component only mounts on entry, so it can't yank a user mid-edit
  // on a page (like the full profile editor) that only exists past the gate.
  const needsOnboarding = !!(requiredRole === "candidate" && profile?.role === "candidate" && profile.completion_pct < 100);
  const onboardingChecked = useRef(false);
  useEffect(() => {
    if (loading || !session || !needsOnboarding || onboardingChecked.current) return;
    onboardingChecked.current = true;
    navigate({ to: "/onboarding" });
  }, [loading, session, needsOnboarding, navigate]);

  if (loading || !session || (requiredRole === "admin" && !isAdmin) || needsOnboarding) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  return <>{children}</>;
}
