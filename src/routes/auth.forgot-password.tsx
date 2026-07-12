import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPassword,
  head: () => ({ meta: [{ title: "Reset password — Proofolio" }] }),
});

function ForgotPassword() {
  const [sent, setSent] = useState(false);
  return (
    <AuthLayout
      title={sent ? "Check your inbox" : "Reset your password"}
      subtitle={sent ? "We sent you a secure reset link. It expires in 15 minutes." : "Enter your email and we'll send a reset link."}
      footer={<Link to="/auth/login" className="text-primary hover:underline">← Back to sign in</Link>}
    >
      {sent ? (
        <div className="rounded-lg border border-border bg-secondary p-6 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Didn't get the email? Check spam or <button onClick={() => setSent(false)} className="text-primary hover:underline">try again</button>.</p>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" required placeholder="you@example.com" />
          </div>
          <Button size="lg" type="submit" className="w-full">Send reset link</Button>
        </form>
      )}
    </AuthLayout>
  );
}
