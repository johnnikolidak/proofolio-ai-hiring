import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({ email: z.string().email().optional() });

export const Route = createFileRoute("/auth/verify-email")({
  validateSearch: (s) => searchSchema.parse(s),
  component: VerifyEmail,
  head: () => ({ meta: [{ title: "Verify email — Proofolio" }] }),
});

function VerifyEmail() {
  const { email } = Route.useSearch();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // Auto-route verified users to the dashboard that matches their role.
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event !== "SIGNED_IN" || !session?.user?.email_confirmed_at) return;
      const uid = session.user.id;
      const [{ data: adminRow }, { data: profileRow }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle(),
        supabase.from("profiles").select("role,completion_pct").eq("id", uid).maybeSingle(),
      ]);
      toast.success("Email verified");
      if (adminRow) navigate({ to: "/admin", replace: true });
      else if (profileRow?.role === "company") navigate({ to: "/company", replace: true });
      else if (profileRow?.role === "university") navigate({ to: "/university", replace: true });
      else if ((profileRow?.completion_pct ?? 0) < 100) navigate({ to: "/onboarding", replace: true });
      else navigate({ to: "/candidate", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const resend = async () => {
    if (!email) {
      toast.error("Enter your email on the sign-up page to resend");
      return;
    }
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/verify-email` },
    });
    setResending(false);
    if (error) toast.error(error.message);
    else toast.success("Verification email sent again.");
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={email ? `We sent a verification link to ${email}. Click it to activate your account.` : "We sent you a verification link. Click it to activate your account."}
      footer={<>Wrong email? <Link to="/auth/signup" className="text-primary hover:underline">Start over</Link></>}
    >
      <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
        <Mail className="h-6 w-6" />
      </div>
      <div className="rounded-lg border border-border bg-secondary p-4 text-center text-sm text-muted-foreground">
        Waiting for you to click the link in your inbox. This page will update automatically once you're verified.
      </div>
      <Button variant="outline" className="mt-6 w-full" onClick={resend} disabled={resending}>
        {resending ? "Sending…" : "Resend verification email"}
      </Button>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Already verified? <Link to="/auth/login" className="text-primary hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
