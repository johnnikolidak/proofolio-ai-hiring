import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Sign in — Proofolio" }] }),
});

function Login() {
  const [role, setRole] = useState<"candidate" | "company">("candidate");
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to Proofolio"
      footer={<>Don't have an account? <Link to="/auth/signup" className="font-medium text-primary hover:underline">Sign up</Link></>}
    >
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg border border-border bg-secondary p-1 text-sm">
        {(["candidate", "company"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`rounded-md px-3 py-1.5 capitalize transition-colors ${role === r ? "bg-background shadow-soft font-medium" : "text-muted-foreground"}`}
          >
            {r}
          </button>
        ))}
      </div>
      <form className="space-y-4">
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" placeholder="you@company.com" />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label>Password</Label>
            <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
          </div>
          <Input type="password" placeholder="••••••••" />
        </div>
        <Button asChild className="w-full" size="lg">
          <Link to={role === "candidate" ? "/candidate" : "/company"}>Sign in</Link>
        </Button>
        <div className="relative py-2">
          <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
          <span className="relative mx-auto block w-fit bg-background px-2 text-xs text-muted-foreground">or continue with</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" type="button">Google</Button>
          <Button variant="outline" type="button">SSO</Button>
        </div>
      </form>
    </AuthLayout>
  );
}
