import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useRedirectIfAuthed, dashboardPathFor } from "@/hooks/use-guest";

export const Route = createFileRoute("/auth/login")({
  component: Login,
  validateSearch: (s: Record<string, unknown>): { next?: string } => ({
    next: typeof s.next === "string" && s.next.startsWith("/") && !s.next.startsWith("//") ? s.next : undefined,
  }),
  head: () => ({ meta: [{ title: "Sign in — Proofolio" }] }),
});


const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

function Login() {
  const { next } = Route.useSearch();
  useRedirectIfAuthed(next);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ email: fd.get("email"), password: fd.get("password") });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) {
      setLoading(false);
      if (error.message.toLowerCase().includes("email not confirmed")) {
        toast.error("Please verify your email first.");
        navigate({ to: "/auth/verify-email", search: { email: parsed.data.email } as never });
        return;
      }
      toast.error("Invalid email or password.");
      return;
    }

    // Return to an OAuth consent (or other) flow when one was preserved.
    if (next) {
      setLoading(false);
      toast.success("Welcome back");
      window.location.href = next;
      return;
    }

    // Determine destination from role
    const userId = data.user.id;
    const [{ data: adminRow }, { data: profileRow }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle(),
      supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
    ]);
    setLoading(false);
    toast.success("Welcome back");
    const dest = dashboardPathFor({ isAdmin: !!adminRow, role: profileRow?.role });
    navigate({ to: dest });

  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to Proofolio"
      footer={<>Don't have an account? <Link to="/auth/signup" className="font-medium text-primary hover:underline">Sign up</Link></>}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input name="email" type="email" placeholder="you@company.com" required />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label>Password</Label>
            <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
          </div>
          <Input name="password" type="password" placeholder="••••••••" required />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
