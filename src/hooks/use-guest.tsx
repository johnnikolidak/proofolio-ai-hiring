import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "./use-auth";

export function dashboardPathFor(opts: { isAdmin?: boolean; role?: string | null; completionPct?: number | null }) {
  // Admin does NOT hijack — role still owns the primary workspace. Admin Console is a menu item.
  if (opts.role === "company") return "/company";
  if (opts.role === "university") return "/university";
  if (opts.role === "candidate") {
    if ((opts.completionPct ?? 0) < 100) return "/onboarding";
    return "/candidate";
  }
  if (opts.isAdmin) return "/admin";
  return "/candidate";
}

export function useRedirectIfAuthed() {
  const { loading, session, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading || !session) return;
    const dest = dashboardPathFor({ isAdmin, role: profile?.role, completionPct: profile?.completion_pct });
    navigate({ to: dest, replace: true });
  }, [loading, session, profile, isAdmin, navigate]);
}
