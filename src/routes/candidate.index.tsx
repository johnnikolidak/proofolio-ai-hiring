import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, Bot, Flame, Sparkles, Target, TrendingUp, Trophy } from "lucide-react";

export const Route = createFileRoute("/candidate/")({
  component: Overview,
  head: () => ({ meta: [{ title: "Overview — Proofolio" }] }),
});

const stats = [
  { label: "Skill score", value: "82", delta: "+6 this month", Icon: TrendingUp },
  { label: "Challenges completed", value: "12", delta: "3 in progress", Icon: Target },
  { label: "Certificates", value: "4", delta: "2 shareable", Icon: Trophy },
  { label: "Streak", value: "18 d", delta: "Personal best", Icon: Flame },
];

const active = [
  { title: "Growth marketing case — Vela", due: "Due in 2 days", progress: 62 },
  { title: "SQL analytics deep-dive", due: "Due in 5 days", progress: 30 },
  { title: "Product spec — Kinetic", due: "Due tomorrow", progress: 85 },
];

const recs = [
  { role: "Junior Growth Analyst", company: "Northwind Labs", match: 92 },
  { role: "Associate PM", company: "Lumen", match: 88 },
  { role: "Data Analyst Intern", company: "Foundry", match: 84 },
];

function Overview() {
  return (
    <>
      <PageHeader
        title="Welcome back, Sofía"
        description="Here's what's happening in your career today."
        actions={<Button asChild><Link to="/candidate/challenges">Browse challenges</Link></Button>}
      />
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-semibold">{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Active challenges</h2>
            <Link to="/candidate/challenges" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="mt-4 space-y-4">
            {active.map((c) => (
              <div key={c.title} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.title}</div>
                    <div className="text-xs text-muted-foreground">{c.due}</div>
                  </div>
                  <Button size="sm" variant="outline">Continue</Button>
                </div>
                <Progress value={c.progress} className="mt-3 h-1.5" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-gradient-to-br from-primary to-[oklch(0.55_0.22_285)] p-6 text-primary-foreground">
          <Sparkles className="h-6 w-6" />
          <h3 className="mt-3 font-semibold">Your next best move</h3>
          <p className="mt-1 text-sm opacity-90">Complete "Product spec — Kinetic" to unlock a Product Analyst certificate.</p>
          <Button asChild variant="secondary" className="mt-5 w-full">
            <Link to="/candidate/roadmap">Open roadmap <ArrowUpRight className="ml-1 h-4 w-4" /></Link>
          </Button>
          <div className="mt-6 border-t border-primary-foreground/20 pt-4">
            <div className="flex items-center gap-2 text-sm"><Bot className="h-4 w-4" /> AI Interview coach</div>
            <p className="mt-1 text-xs opacity-80">Practice for your Northwind interview.</p>
            <Button asChild size="sm" variant="ghost" className="mt-3 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/candidate/interview">Start practice →</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recommended for you</h2>
          <Link to="/candidate/jobs" className="text-xs text-primary hover:underline">See all jobs</Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {recs.map((r) => (
            <div key={r.role} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="rounded-full">{r.match}% match</Badge>
                <span className="text-xs text-muted-foreground">Remote</span>
              </div>
              <div className="mt-3 font-medium">{r.role}</div>
              <div className="text-xs text-muted-foreground">{r.company}</div>
              <Button size="sm" variant="outline" className="mt-4 w-full">Apply</Button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
