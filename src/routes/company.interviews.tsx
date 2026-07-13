import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export const Route = createFileRoute("/company/interviews")({
  component: Interviews,
  head: () => ({ meta: [{ title: "Interviews — Proofolio" }] }),
});

function Interviews() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const q = useQuery({
    enabled: !!user?.id,
    queryKey: ["company", "interviews", user?.id],
    queryFn: async () => {
      const { data: jobs } = await supabase.from("jobs").select("id,title").eq("owner_id", user!.id);
      const jobIds = (jobs ?? []).map((j) => j.id);
      if (!jobIds.length) return { current: [], past: [] };
      const { data: apps } = await supabase
        .from("applications")
        .select("id,job_id,candidate_id,status,updated_at,created_at")
        .in("job_id", jobIds)
        .in("status", ["interview", "offer", "rejected"])
        .order("updated_at", { ascending: false });
      const cids = Array.from(new Set((apps ?? []).map((a) => a.candidate_id)));
      const { data: profs } = cids.length ? await supabase.from("profiles").select("id,full_name,email").in("id", cids) : { data: [] };
      const pById = new Map((profs ?? []).map((p) => [p.id, p]));
      const jById = new Map((jobs ?? []).map((j) => [j.id, j.title]));
      const map = (a: typeof apps extends (infer T)[] | null ? T : never) => ({
        id: a.id, candidateId: a.candidate_id, jobTitle: jById.get(a.job_id) ?? "—", status: a.status,
        name: pById.get(a.candidate_id)?.full_name ?? pById.get(a.candidate_id)?.email ?? "Anonymous",
        updatedAt: a.updated_at,
      });
      const current = (apps ?? []).filter((a) => a.status === "interview").map(map);
      const past = (apps ?? []).filter((a) => a.status !== "interview").map(map);
      return { current, past };
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["company", "interviews"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const openThread = useMutation({
    mutationFn: async (candidateId: string) => {
      const { data: existing } = await supabase.from("message_threads").select("id").eq("candidate_id", candidateId).eq("counterpart_id", user!.id).maybeSingle();
      if (existing) return existing.id;
      const { data, error } = await supabase.from("message_threads").insert({ candidate_id: candidateId, counterpart_id: user!.id, subject: "Interview" }).select("id").single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => toast.success("Conversation opened — see Messages"),
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  const data = q.data ?? { current: [], past: [] };

  return (
    <>
      <PageHeader
        title="Interviews"
        description="Candidates currently at the interview stage. Move to Offer or Reject when done."
      />
      {data.current.length + data.past.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No interviews yet. Move an applicant to the Interview stage from Candidates.</p>
          <Button asChild className="mt-4" variant="outline"><Link to="/company/candidates">Go to Candidates</Link></Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="At interview">
            {data.current.length === 0 ? <Empty label="Nobody at this stage right now." /> : data.current.map((c) => (
              <Row key={c.id} name={c.name} sub={c.jobTitle} status={c.status} updatedAt={c.updatedAt}
                actions={<>
                  <Button size="sm" onClick={() => setStatus.mutate({ id: c.id, status: "offer" })}>Offer</Button>
                  <Button size="sm" variant="outline" onClick={() => openThread.mutate(c.candidateId)}>Message</Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setStatus.mutate({ id: c.id, status: "rejected" })}>Reject</Button>
                </>} />
            ))}
          </Section>
          <Section title="History">
            {data.past.length === 0 ? <Empty label="No interview history yet." /> : data.past.map((c) => (
              <Row key={c.id} name={c.name} sub={c.jobTitle} status={c.status} updatedAt={c.updatedAt} actions={null} />
            ))}
          </Section>
        </div>
      )}
    </>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h3 className="mb-3 text-sm font-semibold text-muted-foreground">{title}</h3><div className="space-y-3">{children}</div></div>;
}
function Empty({ label }: { label: string }) { return <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">{label}</div>; }
function Row({ name, sub, status, updatedAt, actions }: { name: string; sub: string; status: string; updatedAt: string; actions: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><div className="font-medium">{name}</div><div className="text-xs text-muted-foreground">{sub} · {format(new Date(updatedAt), "MMM d, yyyy")}</div></div>
        <Badge className="rounded-full">{status}</Badge>
      </div>
      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
