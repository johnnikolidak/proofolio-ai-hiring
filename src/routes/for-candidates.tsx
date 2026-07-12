import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, Brain, Rocket, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/for-candidates")({
  component: CandidateDemo,
  head: () => ({
    meta: [
      { title: "For candidates — Proofolio" },
      { name: "description", content: "Build a portfolio of real work, get scored by AI, and land the job — for free." },
    ],
  }),
});

function CandidateDemo() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="container-page relative py-20 md:py-28">
          <Badge variant="secondary" className="rounded-full">For candidates</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Skip the resume. <span className="text-gradient">Ship the work.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Real business challenges from real companies. Get AI feedback, earn certificates, and land interviews — even without experience.
          </p>
          <div className="mt-8 flex gap-3">
            <Button asChild size="lg"><Link to="/auth/signup">Create free account <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/candidate">Preview dashboard</Link></Button>
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            [Sparkles, "AI-scored challenges", "Get feedback on every submission with a transparent, evidence-based rubric."],
            [Brain, "AI interview coach", "Practice with an adaptive interviewer trained on the job you're targeting."],
            [Rocket, "Personal roadmap", "Turn every challenge into measurable skill progression tracked over time."],
            [Award, "Verified certificates", "Shareable proof of skill you own — recognized by 400+ hiring teams."],
          ].map(([Icon, t, d]) => (
            <div key={t as string} className="rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-elev">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{t as string}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{d as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-24">
        <div className="rounded-3xl border border-border bg-primary p-12 text-center text-primary-foreground shadow-glow">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Your portfolio, your proof.</h2>
          <p className="mx-auto mt-3 max-w-xl opacity-90">Free forever. No credit card. Get started in under a minute.</p>
          <Button asChild size="lg" variant="secondary" className="mt-6"><Link to="/auth/signup">Get started</Link></Button>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
