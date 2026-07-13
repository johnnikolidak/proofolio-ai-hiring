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

function Candidates() {
  const { user } = useAuth();
  const q = useQuery({
    enabled: !!user?.id,
    queryKey: ["company", "applicants", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("id,status,created_at,cover_note,job:jobs!inner(id,title,company_id),candidate:profiles(id,full_name,headline,avatar_url)")
        .eq("job.company_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
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
            const name = a.candidate?.full_name ?? "Candidate";
            const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
            return (
              <div key={a.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-primary-soft text-primary text-xs font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{name}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.candidate?.headline ?? "—"} · Applied to {a.job?.title} · {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                  </div>
                </div>
                <Badge variant="secondary" className="rounded-full capitalize">{a.status}</Badge>
                {a.candidate?.id && (
                  <Button asChild size="sm" variant="outline">
                    <Link to="/p/$id" params={{ id: a.candidate.id }}>View profile</Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
