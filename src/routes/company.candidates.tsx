import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, MessageSquare, Search } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export const Route = createFileRoute("/company/candidates")({
  component: Candidates,
  head: () => ({ meta: [{ title: "Candidates — Proofolio" }] }),
});

const STATUSES = ["submitted", "in_review", "interview", "offer", "rejected", "withdrawn"] as const;

function Candidates() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const applicantsQ = useQuery({
    enabled: !!user?.id,
    queryKey: ["company", "applicants", user?.id],
    queryFn: async () => {
      const { data: jobs } = await supabase.from("jobs").select("id,title").eq("owner_id", user!.id);
      const jobIds = (jobs ?? []).map((j) => j.id);
      if (jobIds.length === 0) return [];
      const { data: apps, error } = await supabase
        .from("applications")
        .select("id,job_id,candidate_id,status,cover_note,created_at")
        .in("job_id", jobIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const cids = Array.from(new Set((apps ?? []).map((a) => a.candidate_id)));
      const { data: profs } = cids.length
        ? await supabase.from("profiles").select("id,full_name,email,headline,is_public,skills,location").in("id", cids)
        : { data: [] };
      const byId = new Map((profs ?? []).map((p) => [p.id, p]));
      const jobById = new Map((jobs ?? []).map((j) => [j.id, j.title]));
      return (apps ?? []).map((a) => ({
        ...a,
        job_title: jobById.get(a.job_id) ?? "—",
        profile: byId.get(a.candidate_id) ?? null,
      }));
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Stage updated"); qc.invalidateQueries({ queryKey: ["company", "applicants"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const openThread = useMutation({
    mutationFn: async (candidateId: string) => {
      const { data: existing } = await supabase.from("message_threads")
        .select("id").eq("candidate_id", candidateId).eq("counterpart_id", user!.id).maybeSingle();
      if (existing) return existing.id;
      const { data, error } = await supabase.from("message_threads")
        .insert({ candidate_id: candidateId, counterpart_id: user!.id, subject: "About your application" })
        .select("id").single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => { toast.success("Conversation opened — see Messages"); qc.invalidateQueries({ queryKey: ["company", "threads"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = useMemo(() => {
    const list = applicantsQ.data ?? [];
    return list.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!q.trim()) return true;
      const hay = [a.profile?.full_name, a.profile?.email, a.profile?.headline, a.profile?.location, a.job_title, ...(a.profile?.skills ?? [])].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [applicantsQ.data, statusFilter, q]);

  return (
    <>
      <PageHeader title="Candidates" description="Every applicant across your jobs — searchable and actionable." />
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search name, email, skill…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {applicantsQ.isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
          {(applicantsQ.data ?? []).length === 0 ? "No applicants yet. Publish jobs to start receiving applications." : "No matches for that filter."}
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => {
            const name = r.profile?.full_name ?? "Anonymous candidate";
            const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
            return (
              <div key={r.id} className="flex flex-wrap items-start gap-4 rounded-xl border border-border bg-card p-5">
                <Avatar className="h-11 w-11"><AvatarFallback className="bg-primary-soft text-primary text-xs font-semibold">{initials}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold">{name}</div>
                    <Badge variant="secondary" className="rounded-full text-[10px]">{r.job_title}</Badge>
                    <Badge className="rounded-full text-[10px]">{r.status.replace("_", " ")}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{r.profile?.headline ?? r.profile?.email}{r.profile?.location ? ` · ${r.profile.location}` : ""}</div>
                  {(r.profile?.skills ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(r.profile?.skills ?? []).slice(0, 6).map((s) => <Badge key={s} variant="outline" className="rounded-full text-[10px]">{s}</Badge>)}
                    </div>
                  )}
                  {r.cover_note && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">"{r.cover_note}"</p>}
                  <div className="mt-1 text-[11px] text-muted-foreground">Applied {format(new Date(r.created_at), "MMM d, yyyy")}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Select value={r.status} onValueChange={(v) => updateStatus.mutate({ id: r.id, status: v })}>
                    <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}</SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    {r.profile?.is_public && <Button asChild size="sm" variant="outline"><a href={`/p/${r.candidate_id}`} target="_blank" rel="noreferrer">Profile</a></Button>}
                    <Button size="sm" variant="outline" onClick={() => openThread.mutate(r.candidate_id)}><MessageSquare className="h-3 w-3" /></Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
