import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "./use-auth";

/**
 * Redirects a signed-in visitor away from guest-only pages (login, signup,
 * verify-email, forgot-password) to the dashboard that matches their role.
 * Prevents auth loops where an authenticated user is bounced back to the sign-up form.
 */
export function useRedirectIfAuthed() {
  const { loading, session, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading || !session) return;
    const dest = isAdmin
      ? "/admin"
      : profile?.role === "company"
        ? "/company"
        : "/candidate";
    navigate({ to: dest, replace: true });
  }, [loading, session, profile, isAdmin, navigate]);
}

export function dashboardPathFor(opts: { isAdmin: boolean; role?: string | null }) {
  if (opts.isAdmin) return "/admin";
  if (opts.role === "company") return "/company";
  return "/candidate";
}
