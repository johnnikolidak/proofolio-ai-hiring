import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/company/reports")({
  component: Reports,
  head: () => ({ meta: [{ title: "Submissions — Proofolio" }] }),
});

function Reports() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const q = useQuery({
    enabled: !!user?.id,
    queryKey: ["company", "submissions", user?.id],
    queryFn: async () => {
      const { data: chs } = await supabase.from("challenges").select("id,title").eq("owner_id", user!.id);
      const ids = (chs ?? []).map((c) => c.id);
      if (!ids.length) return [];
      const { data: subs, error } = await supabase.from("submissions")
        .select("id,candidate_id,challenge_id,content,file_url,score,feedback,status,created_at")
        .in("challenge_id", ids)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const cids = Array.from(new Set((subs ?? []).map((s) => s.candidate_id)));
      const { data: profs } = cids.length ? await supabase.from("profiles").select("id,full_name,email").in("id", cids) : { data: [] };
      const chById = new Map((chs ?? []).map((c) => [c.id, c.title]));
      const pById = new Map((profs ?? []).map((p) => [p.id, p]));
      return (subs ?? []).map((s) => ({ ...s, challenge_title: chById.get(s.challenge_id) ?? "—", profile: pById.get(s.candidate_id) ?? null }));
    },
  });

  return (
    <>
      <PageHeader title="Submissions" description="Real submissions to your challenges. Score and give feedback here." />
      {q.isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (q.data ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No submissions yet. Publish a challenge to start receiving evidence from candidates.</p>
          <Button asChild className="mt-4" variant="outline"><Link to="/company/library">Manage challenges</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {(q.data ?? []).map((s) => <Row key={s.id} s={s} onSaved={() => qc.invalidateQueries({ queryKey: ["company", "submissions"] })} />)}
        </div>
      )}
    </>
  );
}

function Row({ s, onSaved }: { s: { id: string; candidate_id: string; challenge_title: string; content: string | null; file_url: string | null; score: number | null; feedback: string | null; status: string; created_at: string; profile: { full_name: string | null; email: string } | null }; onSaved: () => void }) {
  const [score, setScore] = useState<string>(s.score != null ? String(s.score) : "");
  const [feedback, setFeedback] = useState(s.feedback ?? "");

  const save = useMutation({
    mutationFn: async () => {
      const n = score === "" ? null : Number(score);
      if (n != null && (Number.isNaN(n) || n < 0 || n > 100)) throw new Error("Score must be 0–100");
      const { error } = await supabase.from("submissions").update({ score: n, feedback: feedback || null, status: n != null ? "reviewed" : s.status }).eq("id", s.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved"); onSaved(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-semibold">{s.profile?.full_name ?? s.profile?.email ?? "Anonymous"}</div>
          <div className="text-xs text-muted-foreground">{s.challenge_title} · Submitted {format(new Date(s.created_at), "MMM d, yyyy")}</div>
        </div>
        <Badge className="rounded-full">{s.status.replace("_", " ")}</Badge>
      </div>
      {s.content && <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground line-clamp-6">{s.content}</p>}
      {s.file_url && <a href={s.file_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-primary underline">{s.file_url}</a>}
      <div className="mt-4 grid gap-3 md:grid-cols-[120px_1fr_auto] md:items-end">
        <div>
          <label className="text-xs text-muted-foreground">Score (0–100)</label>
          <Input type="number" min={0} max={100} value={score} onChange={(e) => setScore(e.target.value)} placeholder="—" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Feedback (shared with candidate)</label>
          <Textarea rows={2} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save</Button>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">A score ≥ 70 issues a verified certificate to the candidate automatically.</p>
    </div>
  );
}
