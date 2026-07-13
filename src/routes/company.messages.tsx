import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Send } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/company/messages")({
  component: Messages,
  head: () => ({ meta: [{ title: "Messages — Proofolio" }] }),
});

type Thread = { id: string; candidate_id: string; counterpart_id: string; subject: string | null; last_message_at: string };
type Msg = { id: string; thread_id: string; sender_id: string; body: string; read_at: string | null; created_at: string };
type Party = { id: string; full_name: string | null; email: string };

function Messages() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [active, setActive] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const threadsQ = useQuery({
    enabled: !!user?.id,
    queryKey: ["company", "threads", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("message_threads")
        .select("id,candidate_id,counterpart_id,subject,last_message_at")
        .or(`candidate_id.eq.${user!.id},counterpart_id.eq.${user!.id}`)
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Thread[];
    },
  });

  const partyIds = useMemo(() => {
    const ids = new Set<string>();
    for (const t of threadsQ.data ?? []) ids.add(t.candidate_id === user?.id ? t.counterpart_id : t.candidate_id);
    return Array.from(ids);
  }, [threadsQ.data, user?.id]);

  const partiesQ = useQuery({
    enabled: partyIds.length > 0,
    queryKey: ["company", "parties", partyIds.join(",")],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id,full_name,email").in("id", partyIds);
      const map = new Map<string, Party>();
      (data ?? []).forEach((p) => map.set(p.id, p as Party));
      return map;
    },
  });

  useEffect(() => {
    if (!active && threadsQ.data && threadsQ.data.length > 0) setActive(threadsQ.data[0].id);
  }, [threadsQ.data, active]);

  const messagesQ = useQuery({
    enabled: !!active,
    queryKey: ["company", "messages", active],
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("*").eq("thread_id", active!).order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Msg[];
    },
    refetchInterval: 8000,
  });

  useEffect(() => {
    if (!active || !user?.id || !messagesQ.data) return;
    const unread = messagesQ.data.filter((m) => m.sender_id !== user.id && !m.read_at).map((m) => m.id);
    if (!unread.length) return;
    supabase.from("messages").update({ read_at: new Date().toISOString() }).in("id", unread).then(() => {
      qc.invalidateQueries({ queryKey: ["company", "messages", active] });
    });
  }, [messagesQ.data, active, user?.id, qc]);

  const send = useMutation({
    mutationFn: async () => {
      if (!active || !draft.trim()) return;
      const { error } = await supabase.from("messages").insert({ thread_id: active, sender_id: user!.id, body: draft.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["company", "messages", active] });
      qc.invalidateQueries({ queryKey: ["company", "threads"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const threads = threadsQ.data ?? [];
  const activeThread = threads.find((t) => t.id === active);
  const partnerId = activeThread ? (activeThread.candidate_id === user?.id ? activeThread.counterpart_id : activeThread.candidate_id) : null;
  const partner = partnerId ? partiesQ.data?.get(partnerId) : null;
  const label = (p: Party | null | undefined) => p ? (p.full_name ?? p.email) : "Candidate";

  return (
    <>
      <PageHeader title="Messages" description="Direct threads with candidates. Start new conversations from the Candidates page." />
      {threadsQ.isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : threads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
          No conversations yet. Open a candidate in <span className="font-medium">Candidates</span> and click the message icon.
        </div>
      ) : (
        <div className="grid min-h-[520px] gap-0 rounded-xl border border-border bg-card md:grid-cols-[320px_1fr]">
          <div className="border-b border-border md:border-b-0 md:border-r overflow-y-auto max-h-[600px]">
            {threads.map((t) => {
              const pId = t.candidate_id === user?.id ? t.counterpart_id : t.candidate_id;
              const p = partiesQ.data?.get(pId);
              return (
                <button key={t.id} onClick={() => setActive(t.id)}
                  className={`flex w-full items-start gap-3 border-b border-border p-4 text-left hover:bg-secondary/60 ${active === t.id ? "bg-secondary" : ""}`}>
                  <Avatar className="h-9 w-9"><AvatarFallback>{label(p ?? null)[0]?.toUpperCase() ?? "?"}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="truncate text-sm font-medium">{label(p ?? null)}</div>
                      <div className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(t.last_message_at), { addSuffix: true })}</div>
                    </div>
                    {t.subject && <div className="truncate text-xs text-muted-foreground">{t.subject}</div>}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col">
            {activeThread ? (
              <>
                <div className="border-b border-border p-4">
                  <div className="font-medium">{label(partner ?? null)}</div>
                  {activeThread.subject && <div className="text-xs text-muted-foreground">{activeThread.subject}</div>}
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto p-4 max-h-[440px]">
                  {(messagesQ.data ?? []).map((m) => (
                    <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-sm rounded-2xl px-4 py-2 text-sm ${m.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                        {m.body}
                        {m.sender_id === user?.id && m.read_at && <Badge variant="secondary" className="ml-2 rounded-full text-[9px]">read</Badge>}
                      </div>
                    </div>
                  ))}
                  {(messagesQ.data ?? []).length === 0 && <p className="text-center text-xs text-muted-foreground">No messages yet.</p>}
                </div>
                <form className="flex items-center gap-2 border-t border-border p-3" onSubmit={(e) => { e.preventDefault(); send.mutate(); }}>
                  <Input placeholder="Write a message…" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={4000} />
                  <Button size="icon" type="submit" disabled={!draft.trim() || send.isPending}>
                    {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </>
            ) : <div className="grid flex-1 place-items-center text-sm text-muted-foreground">Select a conversation.</div>}
          </div>
        </div>
      )}
    </>
  );
}
