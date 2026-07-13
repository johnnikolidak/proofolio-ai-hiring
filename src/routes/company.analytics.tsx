import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/company/analytics")({
  component: Analytics,
  head: () => ({ meta: [{ title: "Analytics — Proofolio" }] }),
});

function Analytics() {
  const { user } = useAuth();

  const q = useQuery({
    enabled: !!user?.id,
    queryKey: ["company", "analytics", user?.id],
    queryFn: async () => {
      const [{ data: jobs }, { data: chs }] = await Promise.all([
        supabase.from("jobs").select("id,status").eq("owner_id", user!.id),
        supabase.from("challenges").select("id,status").eq("owner_id", user!.id),
      ]);
      const jobIds = (jobs ?? []).map((j) => j.id);
      const chIds = (chs ?? []).map((c) => c.id);
      const { data: apps } = jobIds.length ? await supabase.from("applications").select("status").in("job_id", jobIds) : { data: [] };
      const { data: subs } = chIds.length ? await supabase.from("submissions").select("score,status").in("challenge_id", chIds) : { data: [] };

      const funnel: Record<string, number> = { submitted: 0, in_review: 0, interview: 0, offer: 0, rejected: 0, withdrawn: 0 };
      for (const a of apps ?? []) funnel[a.status] = (funnel[a.status] ?? 0) + 1;

      const scored = (subs ?? []).filter((s) => typeof s.score === "number");
      const avgScore = scored.length ? Math.round(scored.reduce((n, s) => n + Number(s.score), 0) / scored.length) : null;
      const passRate = scored.length ? Math.round((scored.filter((s) => Number(s.score) >= 70).length / scored.length) * 100) : null;

      return {
        publishedJobs: (jobs ?? []).filter((j) => j.status === "published").length,
        publishedChallenges: (chs ?? []).filter((c) => c.status === "published").length,
        totalApps: (apps ?? []).length,
        totalSubs: (subs ?? []).length,
        avgScore, passRate,
        funnel: Object.entries(funnel).map(([stage, n]) => ({ stage, n })),
      };
    },
  });

  if (q.isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  const d = q.data!;
  const hasData = d.totalApps + d.totalSubs > 0;

  return (
    <>
      <PageHeader title="Analytics" description="Real-time hiring intelligence, drawn from your Proofolio activity." />
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Published jobs", value: d.publishedJobs },
          { label: "Published challenges", value: d.publishedChallenges },
          { label: "Applications", value: d.totalApps },
          { label: "Submissions", value: d.totalSubs },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="mt-2 text-2xl font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      {!hasData ? (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Not enough data yet. Publish jobs and challenges to see funnel, scoring, and cohort analytics.</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button asChild variant="outline"><Link to="/company/jobs">Manage jobs</Link></Button>
            <Button asChild><Link to="/company/library">Manage challenges</Link></Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold">Application funnel</h3>
            <div className="mt-4 h-72">
              <ResponsiveContainer>
                <BarChart data={d.funnel}>
                  <XAxis dataKey="stage" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="n" fill="oklch(0.63 0.19 265)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold">Scoring</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Stat label="Avg score" value={d.avgScore != null ? `${d.avgScore}` : "—"} sub={d.avgScore == null ? "Score submissions to see averages" : "across scored submissions"} />
              <Stat label="Pass rate (≥70)" value={d.passRate != null ? `${d.passRate}%` : "—"} sub={d.passRate == null ? "No scored submissions yet" : "issues a certificate"} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-primary">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
