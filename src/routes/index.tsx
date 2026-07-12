import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Brain, CheckCircle2, ChevronRight, LineChart, Rocket, ShieldCheck, Sparkles, Target, Trophy, Users, Zap } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { WaitlistForm } from "@/components/WaitlistForm";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  { icon: Target, title: "Real business challenges", desc: "Companies post scoped, real-world briefs. Candidates ship actual work instead of quizzes." },
  { icon: Brain, title: "AI scoring & reports", desc: "Every submission is analyzed on skill, thinking, and communication — with an auditable rubric." },
  { icon: Zap, title: "AI mock interviews", desc: "Adaptive interview simulator trained on your job description with instant feedback." },
  { icon: Rocket, title: "Career roadmap", desc: "Personalized learning paths that turn each challenge into measurable skill progression." },
  { icon: ShieldCheck, title: "Bias-aware hiring", desc: "Blind grading, structured rubrics and audit logs. SOC 2 Type II and GDPR ready." },
  { icon: LineChart, title: "Pipeline analytics", desc: "See funnel conversion, skill heatmaps and cost-per-hire in one live dashboard." },
];

const steps = [
  { n: "01", title: "Post a challenge", body: "Choose a template or build your own with our AI builder. Set skills, time budget and rubric in minutes." },
  { n: "02", title: "Candidates submit proof", body: "Applicants ship a real deliverable — a plan, a prototype, a case, or a code repo — not a CV." },
  { n: "03", title: "AI scores & shortlists", body: "Our models grade against your rubric, flag standouts and generate side-by-side hiring reports." },
  { n: "04", title: "Interview & hire", body: "Move top talent to AI-assisted structured interviews. Extend offers with confidence." },
];

const logos = ["Northwind", "Acme Co.", "Vela", "Lumen", "Foundry", "Kinetic"];

const testimonials = [
  { quote: "Our hiring loop went from 6 weeks to 9 days. The AI reports are shockingly accurate.", name: "Amelia Chen", role: "Head of Talent, Northwind Labs" },
  { quote: "For the first time, students without pedigree can prove they belong. That's the future.", name: "Marcus Reed", role: "University Career Director" },
  { quote: "We hired two engineers and a PM from a single Proofolio campaign. Not a single resume needed.", name: "Priya Shah", role: "Co-founder, Vela" },
];

const pricing = [
  { name: "Starter", price: "$0", cadence: "forever", desc: "For students and early-career talent.", cta: "Start free", features: ["Unlimited challenges", "AI mock interviews (5/mo)", "Verified certificates", "Career roadmap"], featured: false, to: "/auth/signup" },
  { name: "Growth", price: "$490", cadence: "per month", desc: "For teams hiring up to 20 roles a year.", cta: "Start Growth", features: ["Unlimited campaigns", "AI candidate reports", "ATS integrations", "Priority support"], featured: true, to: "/book-demo" },
  { name: "Enterprise", price: "Custom", cadence: "annual", desc: "For orgs with compliance and volume needs.", cta: "Talk to sales", features: ["SSO / SAML", "Custom rubrics", "Dedicated success manager", "SOC 2 report"], featured: false, to: "/book-demo" },
];

const faqs = [
  ["Do candidates really submit real work?", "Yes. Each challenge is scoped to 1–4 hours and mirrors real tasks from the hiring team. Candidates keep IP for their portfolio."],
  ["How does AI scoring stay fair?", "Every rubric is transparent. Our models produce evidence-linked scores that hiring managers can review, override and audit."],
  ["Does this replace interviews?", "No — it replaces the noisy top of the funnel. Teams still meet finalists, but with far better signal going in."],
  ["What about privacy and compliance?", "Proofolio is SOC 2 Type II certified and GDPR compliant. Candidates control their data and can export or delete it anytime."],
  ["Can students use Proofolio for free?", "Always. Candidate accounts are 100% free, including certificates, roadmap and interview practice."],
];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 grid-bg" />
        <div className="container-page relative pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="animate-fade-in-up mb-5 gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs shadow-soft">
              <Sparkles className="h-3 w-3 text-primary" /> Introducing AI Interview 2.0
            </Badge>
            <h1 className="animate-fade-in-up delay-100 text-4xl font-semibold tracking-tight md:text-6xl">
              Hire on <span className="text-gradient">proof of skill.</span><br />Not a resume.
            </h1>
            <p className="animate-fade-in-up delay-200 mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Proofolio connects companies with students and early-career talent through real business challenges — scored by AI, judged by humans.
            </p>
            <div className="animate-fade-in-up delay-300 mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="h-12 gap-1.5 px-6 shadow-elev">
                <Link to="/auth/signup">Start free <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6">
                <Link to="/book-demo">Book a demo</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Free for candidates</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> No credit card</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Setup in 5 min</span>
            </div>
          </div>

          {/* Product mockup */}
          <div className="animate-fade-in-up delay-500 relative mx-auto mt-16 max-w-5xl">
            <div className="rounded-2xl border border-border bg-card p-2 shadow-glow">
              <div className="rounded-xl border border-border bg-background">
                <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning/50" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/40" />
                  <span className="ml-3 text-xs text-muted-foreground">proofolio.app/company/campaigns/growth-analyst</span>
                </div>
                <div className="grid gap-0 md:grid-cols-[220px_1fr]">
                  <div className="border-r border-border p-4 text-sm">
                    <div className="mb-2 text-xs font-medium text-muted-foreground">Pipeline</div>
                    <MockPipeItem label="Applied" n={342} />
                    <MockPipeItem label="Challenge sent" n={214} />
                    <MockPipeItem label="AI-scored" n={188} active />
                    <MockPipeItem label="Shortlisted" n={24} />
                    <MockPipeItem label="Interview" n={9} />
                    <MockPipeItem label="Offer" n={3} />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground">Campaign</div>
                        <div className="text-lg font-semibold">Growth Analyst — Q3</div>
                      </div>
                      <Badge className="rounded-full">Live</Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <MockStat label="Avg. score" value="82.4" />
                      <MockStat label="Time to shortlist" value="3.1 d" />
                      <MockStat label="Diversity index" value="0.71" />
                    </div>
                    <div className="mt-5 rounded-lg border border-border">
                      {[
                        ["Sofía Alvarez", 94, "Strong analytical narrative"],
                        ["Kenji Watanabe", 91, "Excellent modeling depth"],
                        ["Amara Okafor", 88, "Clear structured thinking"],
                      ].map(([name, score, note]) => (
                        <div key={name as string} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0">
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                            {(name as string).split(" ").map((s) => s[0]).join("")}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{name}</div>
                            <div className="text-xs text-muted-foreground">{note}</div>
                          </div>
                          <div className="text-sm font-semibold text-primary">{score}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-page py-8">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Trusted by hiring teams at</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {logos.map((l) => (
              <span key={l} className="text-lg font-semibold tracking-tight text-muted-foreground">{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container-page py-24">
        <SectionIntro eyebrow="Platform" title="Everything you need to hire on skill" description="A complete workflow for skills-based hiring, from challenge to offer." />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div key={f.title} className="animate-fade-in-up group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-elev" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary transition-transform group-hover:scale-110">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-border bg-secondary/40">
        <div className="container-page py-24">
          <SectionIntro eyebrow="How it works" title="From brief to hire in days" description="Skills-based hiring, without the operational overhead." />
          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-border bg-card p-6">
                <div className="text-xs font-semibold tracking-wider text-primary">{s.n}</div>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline"><Link to="/candidate-demo">See candidate demo <ChevronRight className="h-4 w-4" /></Link></Button>
            <Button asChild><Link to="/company-demo">See company demo <ChevronRight className="h-4 w-4" /></Link></Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container-page py-20">
        <div className="grid gap-8 rounded-3xl border border-border bg-gradient-to-br from-primary to-[oklch(0.55_0.22_285)] p-10 text-primary-foreground md:grid-cols-4">
          {[
            ["71%", "Faster time-to-hire"],
            ["3.4×", "More qualified candidates"],
            ["92%", "Manager satisfaction"],
            ["400+", "Companies onboarded"],
          ].map(([v, l]) => (
            <div key={l as string}>
              <div className="text-4xl font-semibold tracking-tight md:text-5xl">{v}</div>
              <div className="mt-2 text-sm opacity-80">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container-page py-24">
        <SectionIntro eyebrow="Pricing" title="Free for talent. Simple for teams." description="Candidates never pay. Companies get a full-stack hiring platform." />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {pricing.map((p) => (
            <div key={p.name} className={`rounded-2xl border p-6 transition-all ${p.featured ? "border-primary bg-card shadow-elev scale-[1.02]" : "border-border bg-card"}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{p.name}</h3>
                {p.featured && <Badge className="rounded-full">Most popular</Badge>}
              </div>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
                <span className="text-sm text-muted-foreground">/ {p.cadence}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              <Button asChild variant={p.featured ? "default" : "outline"} className="mt-6 w-full">
                <Link to={p.to}>{p.cta}</Link>
              </Button>
              <ul className="mt-6 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-page py-24">
          <SectionIntro eyebrow="Loved by teams" title="What people are saying" />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => <Trophy key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <blockquote className="mt-4 text-base leading-relaxed">"{t.quote}"</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary-soft" />
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container-page py-24">
        <div className="grid gap-12 md:grid-cols-[1fr_1.5fr]">
          <div>
            <SectionIntro eyebrow="FAQ" title="Questions, answered." align="left" />
            <div className="mt-6 flex flex-wrap gap-2 text-sm">
              <Button asChild variant="outline"><Link to="/book-demo">Talk to us</Link></Button>
            </div>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map(([q, a], i) => (
              <AccordionItem key={i} value={`i-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium">{q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA + Waitlist */}
      <section className="container-page pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-12 text-center shadow-elev">
          <div className="absolute inset-0 gradient-hero opacity-70" />
          <div className="relative">
            <Users className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Ready to hire on proof?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Join the waitlist — we'll email your invite as soon as your account is ready.</p>
            <div className="mt-8">
              <WaitlistForm source="landing_cta" />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
              <Button asChild size="sm" variant="outline"><Link to="/auth/signup">Create free account</Link></Button>
              <Button asChild size="sm" variant="ghost"><Link to="/book-demo">Book a demo instead</Link></Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function SectionIntro({ eyebrow, title, description, align = "center" }: { eyebrow: string; title: string; description?: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <div className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</div>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-muted-foreground">{description}</p>}
    </div>
  );
}

function MockPipeItem({ label, n, active }: { label: string; n: number; active?: boolean }) {
  return (
    <div className={`mt-1 flex items-center justify-between rounded-md px-2 py-1.5 ${active ? "bg-primary-soft text-primary" : ""}`}>
      <span className="text-xs">{label}</span>
      <span className="text-xs font-semibold">{n}</span>
    </div>
  );
}
function MockStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-lg font-semibold">{value}</div>
    </div>
  );
}
