import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Calendar, Users, Building2, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { sendDemoRequestEmails } from "@/lib/email.functions";

export const Route = createFileRoute("/book-demo")({
  component: BookDemo,
  head: () => ({
    meta: [
      { title: "Book a demo — Proofolio" },
      { name: "description", content: "See how Proofolio can help your team hire on proof of skill in 30 minutes." },
    ],
  }),
});

const schema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email("Enter a valid work email").max(255),
  company: z.string().trim().min(1).max(200),
  team_size: z.string().optional(),
  hires_per_year: z.string().optional(),
  message: z.string().max(2000).optional(),
});

function BookDemo() {
  const [submitted, setSubmitted] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"sent" | "dev_fallback" | "failed" | null>(null);
  const [loading, setLoading] = useState(false);
  const [teamSize, setTeamSize] = useState<string | undefined>();
  const [hires, setHires] = useState<string | undefined>();
  const navigate = useNavigate();
  const sendEmails = useServerFn(sendDemoRequestEmails);
  void navigate;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      first_name: fd.get("first_name"),
      last_name: fd.get("last_name"),
      email: fd.get("email"),
      company: fd.get("company"),
      team_size: teamSize,
      hires_per_year: hires,
      message: fd.get("message") ?? "",
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    setLoading(true);
    const payload = {
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      email: parsed.data.email.toLowerCase(),
      company: parsed.data.company,
      team_size: parsed.data.team_size ?? null,
      hires_per_year: parsed.data.hires_per_year ?? null,
      message: parsed.data.message || null,
    };
    const { error } = await supabase.from("demo_requests").insert(payload);
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }
    // Fire emails in background — do not block success on delivery
    try {
      const res = await sendEmails({ data: payload });
      const status = res.confirm.status === "sent" ? "sent" : res.confirm.status === "dev_fallback" ? "dev_fallback" : "failed";
      setEmailStatus(status as "sent" | "dev_fallback" | "failed");
    } catch {
      setEmailStatus("failed");
    }
    setLoading(false);
    toast.success("Demo request received");
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="container-page grid gap-12 py-16 md:grid-cols-2 md:py-24">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Book a demo</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">See Proofolio in action</h1>
          <p className="mt-4 text-muted-foreground">30 minutes with a hiring strategist. We'll walk through your workflow, show a real campaign live, and answer any questions.</p>
          <ul className="mt-8 space-y-3 text-sm">
            {["Live product tour tailored to your role", "AI report walkthrough on your own JD", "Pricing, security & rollout plan", "No commitment, no slide deck"].map((t) => (
              <li key={t} className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />{t}</li>
            ))}
          </ul>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[[Calendar, "30 min", "Focused walkthrough"], [Users, "Live", "Product tour"], [Building2, "Custom", "For your team"]].map(([Icon, v, l], i) => (
              <div key={i} className="rounded-xl border border-border p-4">
                <Icon className="h-4 w-4 text-primary" />
                <div className="mt-2 text-xl font-semibold">{v as string}</div>
                <div className="text-xs text-muted-foreground">{l as string}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
          {submitted ? (
            <div className="py-16 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-xl font-semibold">You're on the list</h2>
              <p className="mt-2 text-sm text-muted-foreground">We'll reach out within 24 hours to confirm your demo time.</p>
              {emailStatus === "sent" && (
                <p className="mt-3 text-xs text-success">Confirmation email sent — check your inbox.</p>
              )}
              {emailStatus === "dev_fallback" && (
                <p className="mt-3 text-xs text-muted-foreground">Your request is saved. Email delivery is pending sender-domain verification; our team has been notified.</p>
              )}
              {emailStatus === "failed" && (
                <p className="mt-3 text-xs text-warning-foreground">Your request is saved, but our email provider did not accept the message. Our team was still notified in the admin console.</p>
              )}
              <Button asChild variant="outline" className="mt-6"><Link to="/">Back to home</Link></Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <h2 className="text-lg font-semibold">Tell us about your team</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="First name"><Input name="first_name" required placeholder="Ada" /></Field>
                <Field label="Last name"><Input name="last_name" required placeholder="Lovelace" /></Field>
              </div>
              <Field label="Work email"><Input name="email" required type="email" placeholder="ada@company.com" /></Field>
              <Field label="Company"><Input name="company" required placeholder="Northwind Labs" /></Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Team size">
                  <Select value={teamSize} onValueChange={setTeamSize}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {["1–10", "11–50", "51–200", "201–1000", "1000+"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Hires per year">
                  <Select value={hires} onValueChange={setHires}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {["1–10", "10–50", "50–200", "200+"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="What are you hoping to solve?">
                <Textarea name="message" rows={4} placeholder="E.g. reduce time-to-hire for our grad program" />
              </Field>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Request demo
              </Button>
              <p className="text-center text-xs text-muted-foreground">By submitting, you agree to our terms and privacy policy.</p>
            </form>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}
