import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/university/certificates")({ component: Certificates });

type Row = {
  id: string;
  title: string;
  issued_at: string;
  verification_code: string | null;
  candidate_id: string;
  score: number | null;
  student: string;
};

function Certificates() {
  const { user } = useAuth();

  const q = useQuery({
    enabled: !!user?.id,
    queryKey: ["university", "certificates", user?.id],
    queryFn: async (): Promise<Row[]> => {
      // Get the university's challenges, then certificates whose challenge_id is in that set.
      const { data: chals, error: cErr } = await supabase
        .from("challenges").select("id").eq("owner_id", user!.id);
      if (cErr) throw cErr;
      const ids = (chals ?? []).map((c) => c.id);
      if (ids.length === 0) return [];
      const { data: certs, error } = await supabase
        .from("certificates")
        .select("id,title,issued_at,verification_code,candidate_id,score")
        .in("challenge_id", ids)
        .order("issued_at", { ascending: false });
      if (error) throw error;
      const cids = Array.from(new Set((certs ?? []).map((c) => c.candidate_id)));
      const { data: profs } = cids.length
        ? await supabase.from("profiles").select("id,full_name,email").in("id", cids)
        : { data: [] };
      const byId = new Map((profs ?? []).map((p) => [p.id, p]));
      return (certs ?? []).map((c) => ({
        ...c,
        student: byId.get(c.candidate_id)?.full_name || byId.get(c.candidate_id)?.email || "Anonymous",
      }));
    },
  });

  return (
    <>
      <PageHeader title="Certificates" description="Every verified certificate issued from your challenges. Public verification URL included." />
      {q.isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : q.error ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-destructive">Failed to load certificates.</div>
      ) : (q.data ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
          No certificates issued yet. Certificates are automatically issued when a student's submission is scored 70 or above on one of your challenges.
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          {(q.data ?? []).map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-4 border-b border-border p-4 last:border-0">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><Award className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-muted-foreground">
                  {c.student} · Issued {formatDistanceToNow(new Date(c.issued_at), { addSuffix: true })}
                  {c.score !== null ? ` · Score ${c.score}` : ""}
                </div>
              </div>
              {c.verification_code && <Badge variant="outline" className="rounded-full font-mono">{c.verification_code}</Badge>}
              {c.verification_code && (
                <Button size="sm" variant="outline" onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/verify/${c.verification_code}`);
                  toast.success("Verification link copied");
                }}>
                  <ExternalLink className="mr-1 h-3 w-3" /> Copy link
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
