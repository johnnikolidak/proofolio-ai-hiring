import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/candidate/results")({
  component: Results,
  head: () => ({ meta: [{ title: "Challenge results — Proofolio" }] }),
});

function Results() {
  const { user } = useAuth();
  const q = useQuery({
    enabled: !!user?.id,
    queryKey: ["candidate", "results", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenge_attempts")
        .select("id,status,submitted_at,challenge:challenges(id,title,role)")
        .eq("candidate_id", user!.id)
        .eq("status", "submitted")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <>
      <PageHeader title="Challenge results" description="Your submitted challenges." />
      {q.isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (q.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No submissions yet"
          description="Submit a challenge to see your work here."
          action={<Button asChild><Link to="/candidate/challenges">Browse challenges</Link></Button>}
        />
      ) : (
        <div className="space-y-3">
          {q.data!.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{r.challenge?.title ?? "Untitled challenge"}</div>
                  {r.challenge?.role && <div className="text-xs text-muted-foreground">{r.challenge.role}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full">Submitted</Badge>
                  {r.submitted_at && (
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(r.submitted_at), { addSuffix: true })}</span>
                  )}
                  {r.challenge?.id && (
                    <Button asChild size="sm" variant="outline">
                      <Link to="/candidate/challenges/$id" params={{ id: r.challenge.id }}>View</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
