import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Sparkles, Target, Clock, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/company/")({ component: Overview });

const funnelData = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  applied: Math.round(30 + Math.sin(i / 2) * 10 + i * 2),
  scored: Math.round(18 + Math.sin(i / 2) * 6 + i * 1.4),
}));

const activeCampaigns = [
  { name: "Growth Analyst — Q3", applicants: 342, shortlisted: 24, status: "Live" },
  { name: "Product Designer", applicants: 187, shortlisted: 12, status: "Live" },
  { name: "Data Engineer", applicants: 96, shortlisted: 8, status: "Draft" },
];

function Overview() {
  return (
    <>
      <PageHeader
        title="Welcome back, Amelia"
        description="Here's how your hiring is performing this week."
        actions={<Button asChild><Link to="/company/challenge-builder">+ New challenge</Link></Button>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Active campaigns", value: "6", delta: "+2 this month", Icon: Target },
          { label: "Candidates in pipeline", value: "214", delta: "+38 this week", Icon: Users },
          { label: "Avg. time to shortlist", value: "3.1 d", delta: "-1.4 d vs last mo", Icon: Clock },
          { label: "Manager satisfaction", value: "94%", delta: "+3%", Icon: TrendingUp },
        ].map((s) => (
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
            <h3 className="font-semibold">Pipeline over 14 days</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Applied</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[oklch(0.7_0.15_200)]" />AI-scored</span>
            </div>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <AreaChart data={funnelData}>
                <defs>
                  <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.63 0.19 265)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.63 0.19 265)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="a2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.15 200)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.7 0.15 200)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--background)" }} />
                <Area type="monotone" dataKey="applied" stroke="oklch(0.63 0.19 265)" fill="url(#a1)" strokeWidth={2} />
                <Area type="monotone" dataKey="scored" stroke="oklch(0.7 0.15 200)" fill="url(#a2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary to-[oklch(0.55_0.22_285)] p-6 text-primary-foreground">
          <Sparkles className="h-6 w-6" />
          <h3 className="mt-3 font-semibold">AI insight</h3>
          <p className="mt-2 text-sm opacity-90">Candidates from your "Growth Analyst" campaign show a 22% higher rubric fit than last quarter. Consider expanding the sourcing budget.</p>
          <Button asChild variant="secondary" className="mt-4 w-full"><Link to="/company/analytics">View analytics</Link></Button>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Active campaigns</h3>
          <Link to="/company/campaigns" className="text-xs text-primary hover:underline">All campaigns</Link>
        </div>
        <div className="mt-4 space-y-2">
          {activeCampaigns.map((c) => (
            <div key={c.name} className="flex flex-wrap items-center gap-4 rounded-lg border border-border p-4">
              <div className="min-w-0 flex-1">
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.applicants} applicants · {c.shortlisted} shortlisted</div>
              </div>
              <Badge variant={c.status === "Live" ? "default" : "secondary"} className="rounded-full">{c.status}</Badge>
              <Button size="sm" variant="outline">Open</Button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
