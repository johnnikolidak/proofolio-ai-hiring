import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export const Route = createFileRoute("/company/campaigns")({
  component: Campaigns,
  head: () => ({ meta: [{ title: "Campaigns — Proofolio" }] }),
});

function Campaigns() {
  const { user } = useAuth();

  const q = useQuery({
    enabled: !!user?.id,
    queryKey: ["company", "campaigns-view", user?.id],
    queryFn: async () => {
      const [{ data: jobs }, { data: chs }] = await Promise.all([
        supabase.from("jobs").select("id,title,status,created_at").eq("owner_id", user!.id),
        supabase.from("challenges").select("id,title,status,created_at").eq("owner_id", user!.id),
      ]);
      const jobIds = (jobs ?? []).map((j) => j.id);
      const chIds = (chs ?? []).map((c) => c.id);
      const { data: apps } = jobIds.length ? await supabase.from("applications").select("job_id,status").in("job_id", jobIds) : { data: [] };
      const { data: subs } = chIds.length ? await supabase.from("submissions").select("challenge_id").in("challenge_id", chIds) : { data: [] };
      const appCounts = new Map<string, { apps: number; shortlisted: number }>();
      for (const a of apps ?? []) {
        const cur = appCounts.get(a.job_id) ?? { apps: 0, shortlisted: 0 };
        cur.apps++;
        if (["interview", "offer"].includes(a.status)) cur.shortlisted++;
        appCounts.set(a.job_id, cur);
      }
      const subCounts = new Map<string, number>();
      for (const s of subs ?? []) subCounts.set(s.challenge_id, (subCounts.get(s.challenge_id) ?? 0) + 1);
      const jobsRows = (jobs ?? []).map((j) => ({ kind: "job" as const, id: j.id, title: j.title, status: j.status, created_at: j.created_at, apps: appCounts.get(j.id)?.apps ?? 0, shortlisted: appCounts.get(j.id)?.shortlisted ?? 0 }));
      const chRows = (chs ?? []).map((c) => ({ kind: "challenge" as const, id: c.id, title: c.title, status: c.status, created_at: c.created_at, apps: subCounts.get(c.id) ?? 0, shortlisted: 0 }));
      return [...jobsRows, ...chRows].sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
  });

  if (q.isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  const rows = q.data ?? [];

  return (
    <>
      <PageHeader
        title="Campaigns"
        description="Every job and challenge you own, in one live view."
        actions={<><Button asChild variant="outline"><Link to="/company/challenge-builder">+ Challenge</Link></Button><Button asChild><Link to="/company/jobs">+ Job</Link></Button></>}
      />
      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
          No campaigns yet. Create a job or challenge to get started.
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Shortlisted</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={`${r.kind}-${r.id}`}>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell><Badge variant="outline" className="rounded-full">{r.kind}</Badge></TableCell>
                  <TableCell><Badge variant={r.status === "published" ? "default" : "secondary"} className="rounded-full">{r.status}</Badge></TableCell>
                  <TableCell>{r.apps}</TableCell>
                  <TableCell>{r.shortlisted}</TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(r.created_at), "MMM d")}</TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="ghost">
                      {r.kind === "job"
                        ? <Link to="/company/jobs">Open</Link>
                        : <Link to="/company/challenge-builder" search={{ id: r.id }}>Edit</Link>}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
