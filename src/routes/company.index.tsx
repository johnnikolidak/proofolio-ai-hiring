import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export const Route = createFileRoute("/company/")({ component: Overview });

function Overview() {
  const { user, profile } = useAuth();

  const q = useQuery({
    enabled: !!user?.id,
    queryKey: ["company", "overview", user?.id],
    queryFn: async () => {
      const [{ data: jobs }, { data: chs }] = await Promise.all([
        supabase.from("jobs").select("id,title,status,created_at").eq("owner_id", user!.id).order("created_at", { ascending: false }),
        supabase.from("challenges").select("id,title,status,created_at").eq("owner_id", user!.id).order("created_at", { ascending: false }),
      ]);
      const jobIds = (jobs ?? []).map((j) => j.id);
      const chIds = (chs ?? []).map((c) => c.id);
      const { data: apps } = jobIds.length ? await supabase.from("applications").select("job_id,status").in("job_id", jobIds) : { data: [] };
      const { data: subs } = chIds.length ? await supabase.from("submissions").select("challenge_id").in("challenge_id", chIds) : { data: [] };
      const shortlisted = (apps ?? []).filter((a) => ["interview", "offer"].includes(a.status)).length;
      return { jobs: jobs ?? [], chs: chs ?? [], appsTotal: (apps ?? []).length, subsTotal: (subs ?? []).length, shortlisted };
    },
  });

  if (q.isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  const d = q.data!;
  const name = profile?.full_name?.split(" ")[0] ?? profile?.company_name ?? "there";

  return (
    <>
      <PageHeader
        title={`Welcome, ${name}`}
        description="Your Proofolio hiring workspace at a glance."
        actions={<Button asChild><Link to="/company/challenge-builder"><Plus className="mr-1 h-4 w-4" /> New challenge</Link></Button>}
      />
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Published jobs" value={d.jobs.filter((j) => j.status === "published").length} />
        <Stat label="Published challenges" value={d.chs.filter((c) => c.status === "published").length} />
        <Stat label="Total applicants" value={d.appsTotal} />
        <Stat label="In interview / offer" value={d.shortlisted} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Latest jobs</h3>
            <Link to="/company/jobs" className="text-xs text-primary hover:underline">All jobs</Link>
          </div>
          {d.jobs.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No jobs yet. Post your first opening.</div>
          ) : (
            <div className="mt-4 space-y-2">
              {d.jobs.slice(0, 5).map((j) => (
                <div key={j.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{j.title}</div>
                    <div className="text-xs text-muted-foreground">Created {format(new Date(j.created_at), "MMM d")}</div>
                  </div>
                  <Badge variant={j.status === "published" ? "default" : "secondary"} className="rounded-full">{j.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary to-[oklch(0.55_0.22_285)] p-6 text-primary-foreground">
          <Sparkles className="h-6 w-6" />
          <h3 className="mt-3 font-semibold">Get more evidence</h3>
          <p className="mt-2 text-sm opacity-90">Publish a challenge to see real work samples from every applicant — scored, ranked, and reviewable in one place.</p>
          <Button asChild variant="secondary" className="mt-4 w-full"><Link to="/company/library">Manage challenges</Link></Button>
        </div>
      </div>
    </>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
