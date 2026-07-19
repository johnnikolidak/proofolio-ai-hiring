import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CheckCircle2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { safeHref } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/candidate/results")({
  component: Results,
  head: () => ({ meta: [{ title: "Challenge results — Proofolio" }] }),
});

type Row = {
  id: string;
  status: string;
  score: number | null;
  feedback: string | null;
  file_url: string | null;
  content: string | null;
  created_at: string;
  updated_at: string;
  challenges: { id: string; title: string; role: string | null; industry: string | null } | null;
};

function Results() {
  const { user } = useAuth();
  const q = useQuery({
    enabled: !!user?.id,
    queryKey: ["candidate", "results", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("id,status,score,feedback,file_url,content,created_at,updated_at,challenges(id,title,role,industry)")
        .eq("candidate_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  if (q.isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  const rows = q.data ?? [];

  return (
    <>
      <PageHeader title="Challenge results" description="Feedback and scores from every challenge you've submitted." />
      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No submissions yet. Submit a challenge to start collecting evidence.</p>
          <Button asChild className="mt-4"><Link to="/candidate/challenges">Browse challenges</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => {
            const scored = typeof r.score === "number";
            return (
              <div key={r.id} className="rounded-xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">{r.challenges?.title ?? "Challenge"}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      {r.challenges?.role && <span>{r.challenges.role}</span>}
                      {r.challenges?.industry && <span>· {r.challenges.industry}</span>}
                      <span>· Submitted {format(new Date(r.created_at), "MMM d, yyyy")}</span>
                    </div>
                    <div className="mt-2"><Badge className="rounded-full" variant={r.status === "reviewed" || r.status === "shortlisted" ? "default" : "secondary"}>{r.status.replace("_", " ")}</Badge></div>
                  </div>
                  <div className="text-right">
                    {scored ? (
                      <>
                        <div className="text-3xl font-semibold tracking-tight">{r.score}</div>
                        <div className="text-xs text-muted-foreground">Skill score</div>
                      </>
                    ) : (
                      <div className="text-xs text-muted-foreground">Awaiting review</div>
                    )}
                  </div>
                </div>
                {scored && <Progress value={Number(r.score)} className="mt-4 h-1.5" />}
                {r.feedback && (
                  <div className="mt-5 rounded-lg bg-secondary/50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Feedback</div>
                    <p className="mt-1 whitespace-pre-line text-sm">{r.feedback}</p>
                  </div>
                )}
                {(r.content || r.file_url) && (
                  <div className="mt-4 rounded-lg border border-border p-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your evidence</div>
                    {r.content && <p className="mt-1 whitespace-pre-line text-sm line-clamp-4">{r.content}</p>}
                    {safeHref(r.file_url) && <a href={safeHref(r.file_url)} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-primary underline break-all">{r.file_url}</a>}
                  </div>
                )}
                {scored && Number(r.score) >= 70 && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs text-success"><CheckCircle2 className="h-3 w-3" /> Certificate issued — see Certificates</div>
                )}
                <div className="mt-5 flex gap-2">
                  {r.challenges && (
                    <Button asChild size="sm" variant="outline"><Link to="/candidate/challenges/$id" params={{ id: r.challenges.id }}>View challenge</Link></Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
