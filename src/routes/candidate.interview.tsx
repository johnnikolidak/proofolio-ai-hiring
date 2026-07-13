import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { format } from "date-fns";
import { Bot, CheckCircle2, Loader2, Play, Send } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { answerInterview, endInterview, startInterview } from "@/lib/interview.functions";

export const Route = createFileRoute("/candidate/interview")({ component: Interview });

type Session = {
  id: string;
  role_target: string;
  status: string;
  score: number | null;
  ai_summary: string | null;
  ended_at: string | null;
  created_at: string;
};
type Turn = { id: string; role: string; content: string; created_at: string };

function Interview() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [answer, setAnswer] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const start = useServerFn(startInterview);
  const respond = useServerFn(answerInterview);
  const finish = useServerFn(endInterview);

  const sessionsQ = useQuery({
    enabled: !!user?.id,
    queryKey: ["interview-sessions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("interview_sessions").select("*").eq("candidate_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Session[];
    },
  });

  const turnsQ = useQuery({
    enabled: !!activeId,
    queryKey: ["interview-turns", activeId],
    queryFn: async () => {
      const { data, error } = await supabase.from("interview_turns").select("*").eq("session_id", activeId!).neq("role", "system").order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Turn[];
    },
  });

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [turnsQ.data]);

  const activeSession = (sessionsQ.data ?? []).find((s) => s.id === activeId);

  const startM = useMutation({
    mutationFn: async () => {
      if (!role.trim()) throw new Error("Enter the role you're preparing for");
      return await start({ data: { role_target: role.trim() } });
    },
    onSuccess: (res) => {
      setRole("");
      setActiveId(res.session_id);
      qc.invalidateQueries({ queryKey: ["interview-sessions"] });
      qc.invalidateQueries({ queryKey: ["interview-turns", res.session_id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const answerM = useMutation({
    mutationFn: async () => {
      if (!activeId) return;
      return await respond({ data: { session_id: activeId, answer: answer.trim() } });
    },
    onSuccess: () => {
      setAnswer("");
      qc.invalidateQueries({ queryKey: ["interview-turns", activeId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const endM = useMutation({
    mutationFn: async () => {
      if (!activeId) return;
      return await finish({ data: { session_id: activeId } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["interview-sessions"] });
      qc.invalidateQueries({ queryKey: ["interview-turns", activeId] });
      toast.success("Session ended — feedback ready");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader title="AI Interview" description="Real practice interviews scored by AI." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-border bg-card p-6">
          {!activeId ? (
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></div>
                <div>
                  <div className="font-semibold">Start a new session</div>
                  <div className="text-xs text-muted-foreground">Choose the role you're preparing for.</div>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <Input placeholder="e.g. Product Analyst at a SaaS company" value={role} onChange={(e) => setRole(e.target.value)} />
                <Button onClick={() => startM.mutate()} disabled={startM.isPending}>
                  {startM.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-1 h-4 w-4" />} Start
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></div>
                <div>
                  <div className="font-semibold">{activeSession?.role_target ?? "Interview"}</div>
                  <div className="text-xs text-muted-foreground">
                    {activeSession?.status === "completed" ? "Completed" : "In progress"}
                  </div>
                </div>
                <div className="ml-auto flex gap-2">
                  {activeSession?.status === "active" && (
                    <Button size="sm" variant="outline" onClick={() => endM.mutate()} disabled={endM.isPending}>
                      {endM.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />} End & score
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setActiveId(null)}>New session</Button>
                </div>
              </div>

              {activeSession?.status === "completed" && (
                <div className="mt-4 rounded-lg border border-success/40 bg-success/10 p-4">
                  <div className="flex items-center gap-2 text-success"><CheckCircle2 className="h-4 w-4" /><span className="text-sm font-medium">Session complete</span></div>
                  {activeSession.score != null && <div className="mt-2 text-2xl font-semibold">{activeSession.score}<span className="ml-1 text-xs text-muted-foreground">/100</span></div>}
                  {activeSession.ai_summary && <p className="mt-2 text-sm">{activeSession.ai_summary}</p>}
                </div>
              )}

              <div ref={scrollRef} className="mt-6 max-h-[420px] space-y-3 overflow-y-auto">
                {turnsQ.isLoading ? (
                  <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                ) : (turnsQ.data ?? []).map((t) => (
                  <div key={t.id} className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${t.role === "ai" ? "bg-secondary" : "ml-auto bg-primary text-primary-foreground"}`}>{t.content}</div>
                ))}
                {answerM.isPending && <div className="max-w-[80%] rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground"><Loader2 className="inline h-3 w-3 animate-spin" /> Interviewer thinking…</div>}
              </div>

              {activeSession?.status === "active" && (
                <form className="mt-4 space-y-2" onSubmit={(e) => { e.preventDefault(); if (answer.trim()) answerM.mutate(); }}>
                  <Textarea rows={3} placeholder="Type your answer…" value={answer} onChange={(e) => setAnswer(e.target.value)} maxLength={4000} />
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={!answer.trim() || answerM.isPending}>
                      {answerM.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />} Send answer
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        <div>
          <h3 className="font-semibold">Past sessions</h3>
          <div className="mt-3 space-y-3">
            {(sessionsQ.data ?? []).length === 0 && <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">No sessions yet.</div>}
            {(sessionsQ.data ?? []).map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`w-full rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary/40 ${activeId === s.id ? "border-primary" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{s.role_target}</div>
                  {s.score != null && <Badge className="rounded-full">{s.score}</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">{format(new Date(s.created_at), "MMM d, yyyy · p")}</div>
                <div className="mt-1 text-[11px] text-muted-foreground capitalize">{s.status}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
