import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Rocket, ShieldCheck, Target } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/for-companies")({
  component: ForCompanies,
  head: () => ({
    meta: [
      { title: "For companies — Proofolio" },
      { name: "description", content: "Hire on proof of skill. Real challenges, AI-scored candidate reports, and a modern hiring workflow." },
      { property: "og:title", content: "For companies — Proofolio" },
      { property: "og:description", content: "Skills-first hiring workflow: challenges, AI reports, structured interviews." },
    ],
  }),
});

function ForCompanies() {
  const { session, profile, isAdmin } = useAuth();
  const isCompany = isAdmin || profile?.role === "company";
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="container-page relative py-20 md:py-28">
          <Badge variant="secondary" className="rounded-full">For companies</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            A modern hiring stack, <span className="text-gradient">built on skill.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Launch skill challenges, get AI-scored candidate reports, and run structured interviews — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {session && isCompany ? (
              <Button asChild size="lg"><Link to="/company">Open company workspace <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            ) : session ? (
              <>
                <Button asChild size="lg"><Link to="/book-demo">Book a demo <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
                <Button asChild size="lg" variant="outline"><Link to="/auth/signup" search={{ role: "company" }}>Create company account</Link></Button>
              </>
            ) : (
              <>
                <Button asChild size="lg"><Link to="/book-demo">Book a demo <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
                <Button asChild size="lg" variant="outline"><Link to="/auth/signup" search={{ role: "company" }}>Create company account</Link></Button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            [Target, "Challenge Builder", "Ship a scoped, on-brand challenge in minutes with AI-assisted templates."],
            [Rocket, "AI candidate reports", "Evidence-linked scores your hiring managers can trust and audit."],
            [BarChart3, "Pipeline analytics", "Funnel conversion, skill heatmaps and cost-per-hire in real time."],
            [ShieldCheck, "Compliance-ready", "SOC 2 Type II, GDPR, SSO/SAML and full data controls."],
          ].map(([Icon, t, d]) => (
            <div key={t as string} className="rounded-2xl border border-border bg-card p-6">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{t as string}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{d as string}</p>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
