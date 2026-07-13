import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Clock, Loader2, Save, Send } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { formatChallengeDuration } from "@/lib/utils";

export const Route = createFileRoute("/candidate/challenges/$id")({ component: ChallengeDetail });

function ChallengeDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const challengeQ = useQuery({
    queryKey: ["challenge", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("challenges").select("*").eq("id", id).eq("status", "published").maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const attemptQ = useQuery({
    enabled: !!user?.id,
    queryKey: ["attempt", id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("challenge_attempts").select("*").eq("candidate_id", user!.id).eq("challenge_id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  useEffect(() => {
    if (attemptQ.data) {
      setContent(attemptQ.data.content ?? "");
      setFileUrl(attemptQ.data.file_url ?? "");
    }
  }, [attemptQ.data]);

  const startMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("challenge_attempts").upsert({ candidate_id: user!.id, challenge_id: id, status: "in_progress" }, { onConflict: "candidate_id,challenge_id" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Challenge started"); qc.invalidateQueries({ queryKey: ["attempt", id] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("challenge_attempts").upsert({
        candidate_id: user!.id, challenge_id: id, content: content || null, file_url: fileUrl || null, status: "in_progress",
      }, { onConflict: "candidate_id,challenge_id" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Progress saved"); qc.invalidateQueries({ queryKey: ["attempt", id] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!content.trim() && !fileUrl.trim()) throw new Error("Add a written summary or a file link before submitting.");
      // Guard against duplicate submission
      if (attemptQ.data?.status === "submitted") throw new Error("Already submitted.");
      const { error: upErr } = await supabase.from("challenge_attempts").upsert({
        candidate_id: user!.id, challenge_id: id, content: content || null, file_url: fileUrl || null, status: "submitted", submitted_at: new Date().toISOString(),
      }, { onConflict: "candidate_id,challenge_id" });
      if (upErr) throw upErr;
      // Also write to submissions so companies see it (unique per candidate+challenge would be enforced at DB in future)
      const { error: sErr } = await supabase.from("submissions").insert({
        candidate_id: user!.id, challenge_id: id, content: content || null, file_url: fileUrl || null, status: "submitted",
      });
      if (sErr && !sErr.message.toLowerCase().includes("duplicate")) throw sErr;
    },
    onSuccess: () => {
      toast.success("Submission received");
      qc.invalidateQueries({ queryKey: ["attempt", id] });
      setConfirmSubmit(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (challengeQ.isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!challengeQ.data) return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <p className="text-sm text-muted-foreground">Challenge not found or not yet published.</p>
      <Button asChild variant="outline" className="mt-4"><Link to="/candidate/challenges"><ArrowLeft className="mr-1.5 h-4 w-4" />Back to challenges</Link></Button>
    </div>
  );

  const c = challengeQ.data;
  const attempt = attemptQ.data;
  const isSubmitted = attempt?.status === "submitted";

  return (
    <>
      <PageHeader
        title={c.title}
        description={c.role ?? undefined}
        actions={<Button asChild variant="outline" size="sm"><Link to="/candidate/challenges"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back</Link></Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {c.context && <Card title="Context"><p className="text-sm whitespace-pre-line">{c.context}</p></Card>}
          {c.task && <Card title="Your task"><p className="text-sm whitespace-pre-line">{c.task}</p></Card>}
          {c.deliverables && <Card title="Deliverables"><p className="text-sm whitespace-pre-line">{c.deliverables}</p></Card>}
          {c.evaluation_criteria && <Card title="How you'll be evaluated"><p className="text-sm whitespace-pre-line">{c.evaluation_criteria}</p></Card>}

          <Card title="Your submission">
            {isSubmitted ? (
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-xs text-success"><CheckCircle2 className="h-3 w-3" /> Submitted {attempt.submitted_at ? formatDistanceToNow(new Date(attempt.submitted_at), { addSuffix: true }) : ""}</div>
                {attempt.content && <p className="mt-4 whitespace-pre-line text-sm">{attempt.content}</p>}
                {attempt.file_url && <a href={attempt.file_url} target="_blank" rel="noreferrer" className="mt-2 block text-sm text-primary underline">{attempt.file_url}</a>}
              </div>
            ) : !attempt ? (
              <div>
                <p className="text-sm text-muted-foreground">Start this challenge to save progress and submit deliverables.</p>
                <Button className="mt-4" onClick={() => startMutation.mutate()} disabled={startMutation.isPending}>
                  {startMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Start challenge
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium">Written summary</label>
                  <Textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Describe your approach, findings, and recommendations." />
                </div>
                <div>
                  <label className="text-xs font-medium">Deliverable link (Figma, Docs, GitHub, Loom…)</label>
                  <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://…" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save progress
                  </Button>
                  {confirmSubmit ? (
                    <>
                      <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
                        {submitMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Confirm submit
                      </Button>
                      <Button variant="ghost" onClick={() => setConfirmSubmit(false)}>Cancel</Button>
                    </>
                  ) : (
                    <Button onClick={() => setConfirmSubmit(true)}><Send className="mr-2 h-4 w-4" /> Submit</Button>
                  )}
                </div>
                {confirmSubmit && <p className="text-xs text-muted-foreground">Submissions are final. Please double-check your work.</p>}
              </div>
            )}
          </Card>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs text-muted-foreground">Difficulty</div>
            <div className="mt-1 font-medium">{c.difficulty ?? "—"}</div>
            <div className="mt-3 text-xs text-muted-foreground">Estimated time</div>
            <div className="mt-1 inline-flex items-center gap-1 font-medium"><Clock className="h-3 w-3" /> {formatChallengeDuration(c)}</div>
            {(c.evidence_dimensions ?? []).length > 0 && (
              <>
                <div className="mt-3 text-xs text-muted-foreground">Evidence dimensions</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {(c.evidence_dimensions ?? []).map((s: string) => <Badge key={s} variant="outline" className="rounded-full text-[10px]">{s}</Badge>)}
                </div>
              </>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/candidate/challenges" })}><ArrowLeft className="mr-1.5 h-4 w-4" /> All challenges</Button>
        </aside>
      </div>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-card p-6"><h3 className="font-semibold">{title}</h3><div className="mt-3">{children}</div></div>;
}
