import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "./use-auth";

export function dashboardPathFor(opts: { isAdmin?: boolean; role?: string | null }) {
  // Admin does NOT hijack — role still owns the primary workspace. Admin Console is a menu item.
  if (opts.role === "company") return "/company";
  if (opts.role === "university") return "/university";
  if (opts.role === "candidate") return "/candidate";
  if (opts.isAdmin) return "/admin";
  return "/candidate";
}

export function useRedirectIfAuthed(next?: string) {
  const { loading, session, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading || !session) return;
    // A preserved same-origin relative path (e.g. an OAuth consent URL) wins.
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      window.location.href = next;
      return;
    }
    const dest = dashboardPathFor({ isAdmin, role: profile?.role });
    navigate({ to: dest, replace: true });
  }, [loading, session, profile, isAdmin, navigate, next]);
}

