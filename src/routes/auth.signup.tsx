import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { GraduationCap, Building2, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/signup")({
  component: SignUp,
  head: () => ({ meta: [{ title: "Sign up — Proofolio" }] }),
});

const schema = z.object({
  first_name: z.string().trim().min(1, "First name required").max(60),
  last_name: z.string().trim().min(1, "Last name required").max(60),
  email: z.string().trim().email("Enter a valid email").max(255),
  company_name: z.string().trim().max(200).optional().or(z.literal("")),
  password: z.string().min(8, "At least 8 characters").max(72),
});

function SignUp() {
  const [role, setRole] = useState<"candidate" | "company">("candidate");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      first_name: fd.get("first_name"),
      last_name: fd.get("last_name"),
      email: fd.get("email"),
      company_name: fd.get("company_name") ?? "",
      password: fd.get("password"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    if (role === "company" && !parsed.data.company_name) {
      toast.error("Company name is required for company accounts");
      return;
    }

    setLoading(true);
    const emailRedirectTo = `${window.location.origin}/auth/verify-email`;
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo,
        data: {
          role,
          full_name: `${parsed.data.first_name} ${parsed.data.last_name}`.trim(),
          company_name: role === "company" ? parsed.data.company_name : null,
        },
      },
    });
    setLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("already registered") || error.message.toLowerCase().includes("user already")) {
        toast.error("An account with this email already exists. Try signing in.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success("Account created — check your inbox to verify your email.");
    navigate({ to: "/auth/verify-email", search: { email: parsed.data.email } as never });

    // Silence "unused" — data may include a session in some Supabase configs.
    void data;
  };

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
            type="button"
            onClick={() => setRole(r.key)}
            className={`rounded-xl border p-3 text-left transition-all ${role === r.key ? "border-primary bg-primary-soft" : "border-border hover:border-primary/50"}`}
          >
            <r.Icon className={`h-5 w-5 ${role === r.key ? "text-primary" : "text-muted-foreground"}`} />
            <div className="mt-2 text-sm font-medium">{r.label}</div>
            <div className="text-xs text-muted-foreground">{r.desc}</div>
          </button>
        ))}
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>First name</Label><Input name="first_name" placeholder="Ada" required /></div>
          <div className="space-y-1.5"><Label>Last name</Label><Input name="last_name" placeholder="Lovelace" required /></div>
        </div>
        <div className="space-y-1.5"><Label>Email</Label><Input name="email" type="email" placeholder="you@example.com" required /></div>
        {role === "company" && (
          <div className="space-y-1.5"><Label>Company</Label><Input name="company_name" placeholder="Northwind Labs" required /></div>
        )}
        <div className="space-y-1.5"><Label>Password</Label><Input name="password" type="password" placeholder="At least 8 characters" minLength={8} required /></div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create account
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to our Terms and Privacy Policy.
        </p>
      </form>
    </AuthLayout>
  );
}
