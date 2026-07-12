import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, GraduationCap, LayoutDashboard, School, ShieldCheck, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { dashboardPathFor } from "@/hooks/use-guest";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Proofolio — Hire on proof of skill, not a résumé" },
      { name: "description", content: "Proofolio is the skills platform for candidates, companies and universities. Real business challenges. AI-scored evidence. Verified proof profiles." },
      { property: "og:title", content: "Proofolio — Hire on proof of skill" },
      { property: "og:description", content: "One platform. Three experiences. Candidates prove skills. Companies hire on evidence. Universities connect students to employers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const paths = [
  {
    key: "candidates",
    Icon: GraduationCap,
    tag: "For candidates",
    title: "Prove your skills. Get hired.",
    desc: "Build a Proof Profile through real business challenges. Get AI feedback, earn verified certificates, apply to roles that value evidence over pedigree.",
    href: "/for-candidates",
    signupHref: "/auth/signup?role=candidate",
    accent: "from-primary to-[oklch(0.55_0.22_285)]",
  },
  {
    key: "companies",
    Icon: Building2,
    tag: "For companies",
    title: "Hire on evidence, not resumes.",
    desc: "Run real business challenges, receive AI-scored submissions, and interview only the candidates who have already shown they can do the work.",
    href: "/for-companies",
    signupHref: "/auth/signup?role=company",
    accent: "from-[oklch(0.65_0.15_220)] to-[oklch(0.55_0.18_260)]",
  },
  {
    key: "universities",
    Icon: School,
    tag: "For universities",
    title: "Connect students to employers.",
    desc: "Run campus challenges with employer partners, track evidence dimensions, issue verified certificates and give students a Proof Profile that opens doors.",
    href: "/for-universities",
    signupHref: "/for-universities#partner",
    accent: "from-[oklch(0.6_0.18_160)] to-[oklch(0.5_0.2_200)]",
  },
];

function Landing() {
  const { session, profile, isAdmin } = useAuth();
  const dash = dashboardPathFor({ isAdmin, role: profile?.role });

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 grid-bg" />
        <div className="container-page relative pt-20 pb-14 md:pt-28 md:pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="animate-fade-in-up mb-5 gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs shadow-soft">
              <Sparkles className="h-3 w-3 text-primary" /> One platform. Three experiences.
            </Badge>
            <h1 className="animate-fade-in-up delay-100 text-4xl font-semibold tracking-tight md:text-6xl">
              Hire on <span className="text-gradient">proof of skill.</span>
              <br />Not a résumé.
            </h1>
            <p className="animate-fade-in-up delay-200 mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Proofolio replaces guesswork with evidence. Candidates prove their abilities through real business challenges. Companies evaluate real work before interviews. Universities connect their students to employers with verified proof profiles.
            </p>
            {session && (
              <div className="animate-fade-in-up delay-300 mt-8">
                <Button asChild size="lg" className="h-12 gap-1.5 px-6 shadow-elev">
                  <Link to={dash}><LayoutDashboard className="h-4 w-4" /> Open your dashboard <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="choose" className="container-page pb-20 md:pb-28">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Choose your path</h2>
          <p className="mt-2 text-sm text-muted-foreground">Each experience is a complete platform with its own tools, dashboard and workflows.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {paths.map((p) => (
            <Link
              key={p.key}
              to={p.href}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-glow"
            >
              <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${p.accent} text-primary-foreground shadow-soft`}>
                <p.Icon className="h-7 w-7" />
              </div>
              <div className="mt-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">{p.tag}</div>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
              <div className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                Explore {p.tag.toLowerCase().replace("for ", "")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30">
        <div className="container-page py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              [Sparkles, "Real work, not quizzes", "Every challenge is a scoped, realistic brief that mirrors the actual role."],
              [ShieldCheck, "Evidence you can audit", "Transparent rubrics, evidence-linked scores, human review, exportable logs."],
              [GraduationCap, "A résumé that proves itself", "Candidates own a public Proof Profile. Certificates verify each achievement."],
            ].map(([Icon, t, d]) => (
              <div key={t as string}>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{t as string}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{d as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
