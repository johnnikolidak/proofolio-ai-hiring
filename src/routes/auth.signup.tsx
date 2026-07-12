import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Building2 } from "lucide-react";

export const Route = createFileRoute("/auth/signup")({
  component: SignUp,
  head: () => ({ meta: [{ title: "Sign up — Proofolio" }] }),
});

function SignUp() {
  const [role, setRole] = useState<"candidate" | "company">("candidate");
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free for candidates. 14-day trial for teams."
      footer={<>Already have an account? <Link to="/auth/login" className="font-medium text-primary hover:underline">Sign in</Link></>}
    >
      <div className="mb-5 grid grid-cols-2 gap-3">
        {[
          { key: "candidate" as const, Icon: GraduationCap, label: "I'm a candidate", desc: "Free forever" },
          { key: "company" as const, Icon: Building2, label: "I'm hiring", desc: "Start a trial" },
        ].map((r) => (
          <button
            key={r.key}
            onClick={() => setRole(r.key)}
            className={`rounded-xl border p-3 text-left transition-all ${role === r.key ? "border-primary bg-primary-soft" : "border-border hover:border-primary/50"}`}
          >
            <r.Icon className={`h-5 w-5 ${role === r.key ? "text-primary" : "text-muted-foreground"}`} />
            <div className="mt-2 text-sm font-medium">{r.label}</div>
            <div className="text-xs text-muted-foreground">{r.desc}</div>
          </button>
        ))}
      </div>
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>First name</Label><Input placeholder="Ada" /></div>
          <div className="space-y-1.5"><Label>Last name</Label><Input placeholder="Lovelace" /></div>
        </div>
        <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="you@example.com" /></div>
        {role === "company" && (
          <div className="space-y-1.5"><Label>Company</Label><Input placeholder="Northwind Labs" /></div>
        )}
        <div className="space-y-1.5"><Label>Password</Label><Input type="password" placeholder="At least 8 characters" /></div>
        <Button asChild size="lg" className="w-full">
          <Link to="/auth/verify-email">Create account</Link>
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to our Terms and Privacy Policy.
        </p>
      </form>
    </AuthLayout>
  );
}
