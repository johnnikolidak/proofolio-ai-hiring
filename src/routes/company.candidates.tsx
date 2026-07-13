import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/company/candidates")({ component: Candidates });

type ApplicantRow = {
  id: string;
  status: string;
  created_at: string;
  candidate_id: string;
  job: { id: string; title: string } | null;
  candidate_name: string;
  candidate_headline: string | null;
};

function Candidates() {
  const { user } = useAuth();
  const q = useQuery({
    enabled: !!user?.id,
    queryKey: ["company", "applicants", user?.id],
    queryFn: async (): Promise<ApplicantRow[]> => {
      const { data: jobs } = await supabase.from("jobs").select("id,title").eq("owner_id", user!.id);
      const jobIds = (jobs ?? []).map((j) => j.id);
      if (jobIds.length === 0) return [];
      const { data: apps, error } = await supabase
        .from("applications")
        .select("id,status,created_at,candidate_id,job_id")
        .in("job_id", jobIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const candidateIds = Array.from(new Set((apps ?? []).map((a) => a.candidate_id)));
      const { data: profiles } = candidateIds.length
        ? await supabase.from("profiles").select("id,full_name,headline").in("id", candidateIds)
        : { data: [] as { id: string; full_name: string | null; headline: string | null }[] };
      const jobsById = new Map((jobs ?? []).map((j) => [j.id, j] as const));
      const profById = new Map((profiles ?? []).map((p) => [p.id, p] as const));
      return (apps ?? []).map((a) => {
        const j = jobsById.get(a.job_id);
        const p = profById.get(a.candidate_id);
        return {
          id: a.id,
          status: a.status,
          created_at: a.created_at,
          candidate_id: a.candidate_id,
          job: j ? { id: j.id, title: j.title } : null,
          candidate_name: p?.full_name ?? "Candidate",
          candidate_headline: p?.headline ?? null,
        };
      });
    },
  });

  return (
    <>
      <PageHeader title="Applicants" description="Every application submitted to your jobs." />
      {q.isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (q.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={Users}
          title="No applicants yet"
          description="Post a job to start receiving applications from candidates with verified Proof Profiles."
          action={<Button asChild><Link to="/company/jobs">Post a job</Link></Button>}
        />
      ) : (
        <div className="grid gap-3">
          {q.data!.map((a) => {
            const initials = a.candidate_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
            return (
              <div key={a.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-primary-soft text-primary text-xs font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{a.candidate_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.candidate_headline ?? "—"} · Applied to {a.job?.title ?? "job"} · {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                  </div>
                </div>
                <Badge variant="secondary" className="rounded-full capitalize">{a.status}</Badge>
                <Button asChild size="sm" variant="outline">
                  <Link to="/p/$id" params={{ id: a.candidate_id }}>View profile</Link>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
