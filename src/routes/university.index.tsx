import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Award, Handshake, Target, TrendingUp, Trophy, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/university/")({ component: Overview });

const stats = [
  { label: "Active campus challenges", value: "8", delta: "3 this month", Icon: Target },
  { label: "Participating students", value: "1,284", delta: "+142 this week", Icon: Users },
  { label: "Employer partners", value: "17", delta: "+2 this month", Icon: Handshake },
  { label: "Certificates issued", value: "412", delta: "+38 this month", Icon: Award },
];

const upcoming = [
  { title: "Q3 Analyst Sprint — sponsored by Northwind", due: "Deadline in 4 days", participants: 214 },
  { title: "Product Design Studio — Vela", due: "Deadline in 9 days", participants: 96 },
  { title: "Data Storytelling — Lumen", due: "Deadline in 14 days", participants: 148 },
];

function Overview() {
  const { profile } = useAuth();
  const name = profile?.full_name?.split(" ")[0] || profile?.company_name || "there";
  return (
    <>
      <PageHeader
        title={`Welcome back, ${name}`}
        description="Your campus challenge activity at a glance."
        actions={<Button asChild><Link to="/university/challenges">Manage challenges</Link></Button>}
      />
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-semibold">{s.value}</div>
            <div className="mt-1 text-xs text-success">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Upcoming deadlines</h2>
            <Link to="/university/challenges" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {upcoming.map((u) => (
              <div key={u.title} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <div className="font-medium">{u.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{u.due} · {u.participants} students</div>
                </div>
                <Button asChild size="sm" variant="outline"><Link to="/university/challenges">Open</Link></Button>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary to-[oklch(0.5_0.2_200)] p-6 text-primary-foreground">
          <TrendingUp className="h-6 w-6" />
          <h3 className="mt-3 font-semibold">Cohort insight</h3>
          <p className="mt-2 text-sm opacity-90">Communication scores in your Autumn cohort are up 18% since the last programme. Structured thinking still trails — schedule a follow-up challenge.</p>
          <Button asChild variant="secondary" className="mt-5 w-full">
            <Link to="/university/analytics">Open analytics</Link>
          </Button>
          <div className="mt-6 border-t border-primary-foreground/20 pt-4">
            <div className="flex items-center gap-2 text-sm"><Trophy className="h-4 w-4" /> Top student this week</div>
            <p className="mt-1 text-xs opacity-80">Sofía A. — 94 avg. across 3 challenges</p>
          </div>
        </div>
      </div>
    </>
  );
}
