import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/company/shortlists")({
  component: Shortlists,
  head: () => ({ meta: [{ title: "Shortlists — Proofolio" }] }),
});

function Shortlists() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const q = useQuery({
    enabled: !!user?.id,
    queryKey: ["company", "shortlists", user?.id],
    queryFn: async () => {
      const { data: jobs } = await supabase.from("jobs").select("id,title").eq("owner_id", user!.id);
      const jobIds = (jobs ?? []).map((j) => j.id);
      if (!jobIds.length) return [];
      const { data: apps } = await supabase
        .from("applications")
        .select("id,job_id,candidate_id,status,created_at")
        .in("job_id", jobIds)
        .in("status", ["interview", "offer"]);
      const cids = Array.from(new Set((apps ?? []).map((a) => a.candidate_id)));
      const { data: profs } = cids.length ? await supabase.from("profiles").select("id,full_name,email,headline").in("id", cids) : { data: [] };
      const byId = new Map((profs ?? []).map((p) => [p.id, p]));
      const jobById = new Map((jobs ?? []).map((j) => [j.id, j.title]));
      const grouped: Record<string, { jobId: string; jobTitle: string; people: Array<{ appId: string; candidateId: string; status: string; name: string; sub: string }> }> = {};
      for (const a of apps ?? []) {
        const jt = jobById.get(a.job_id) ?? "—";
        grouped[a.job_id] ??= { jobId: a.job_id, jobTitle: jt, people: [] };
        const p = byId.get(a.candidate_id);
        grouped[a.job_id].people.push({
          appId: a.id, candidateId: a.candidate_id, status: a.status,
          name: p?.full_name ?? "Anonymous",
          sub: p?.headline ?? p?.email ?? "",
        });
      }
      return Object.values(grouped);
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["company", "shortlists"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const groups = q.data ?? [];

  return (
    <>
      <PageHeader title="Shortlists" description="Applicants you've moved to interview or offer, grouped by job." />
      {q.isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No one is shortlisted yet. Move applicants to Interview from the Candidates page.</p>
          <Button asChild className="mt-4" variant="outline"><Link to="/company/candidates">Go to Candidates</Link></Button>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.jobId} className="rounded-xl border border-border bg-card">
              <div className="border-b border-border p-5">
                <div className="font-semibold">{g.jobTitle}</div>
                <div className="text-xs text-muted-foreground">{g.people.length} shortlisted</div>
              </div>
              <div>
                {g.people.map((p) => (
                  <div key={p.appId} className="flex flex-wrap items-center gap-3 border-b border-border p-4 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.sub}</div>
                    </div>
                    <Badge className="rounded-full">{p.status}</Badge>
                    {p.status === "interview" ? (
                      <>
                        <Button size="sm" onClick={() => setStatus.mutate({ id: p.appId, status: "offer" })}>Offer</Button>
                        <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: p.appId, status: "in_review" })}>Back to review</Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: p.appId, status: "interview" })}>Back to interview</Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setStatus.mutate({ id: p.appId, status: "rejected" })}>Reject</Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
