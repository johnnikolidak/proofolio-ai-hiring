import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/reset-password")({
  component: ResetPassword,
  head: () => ({ meta: [{ title: "Set a new password — Proofolio" }] }),
});

const schema = z
  .object({
    password: z.string().min(8, "At least 8 characters").max(72),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] });

function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase v2 auto-parses the recovery link and fires PASSWORD_RECOVERY.
    // We just need a session to be present before we can call updateUser.
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      setReady(!!data.session);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ password: fd.get("password"), confirm: fd.get("confirm") });
    if (!parsed.success) return toast.error(parsed.error.issues[0]!.message);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. You're signed in.");
    navigate({ to: "/candidate" });
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle={ready ? "Choose a strong password you haven't used elsewhere." : "Open the link from your email to continue."}
      footer={<Link to="/auth/login" className="text-primary hover:underline">← Back to sign in</Link>}
    >
      {!ready ? (
        <div className="rounded-lg border border-border bg-secondary p-6 text-center text-sm text-muted-foreground">
          Waiting for a valid recovery link…
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5"><Label>New password</Label><Input name="password" type="password" required minLength={8} /></div>
          <div className="space-y-1.5"><Label>Confirm password</Label><Input name="confirm" type="password" required minLength={8} /></div>
          <Button size="lg" type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
