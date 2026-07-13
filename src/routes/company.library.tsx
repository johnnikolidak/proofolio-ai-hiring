import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Loader2, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/company/library")({
  component: Library,
  head: () => ({ meta: [{ title: "Challenge Library — Proofolio" }] }),
});

function Library() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const q = useQuery({
    enabled: !!user?.id,
    queryKey: ["company", "challenges", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("id,title,role,industry,difficulty,duration_hours,status,created_at,evidence_dimensions")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "draft" | "published" | "archived" }) => {
      const { error } = await supabase.from("challenges").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["company", "challenges"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("challenges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["company", "challenges"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const duplicate = useMutation({
    mutationFn: async (id: string) => {
      const { data: src, error } = await supabase.from("challenges").select("*").eq("id", id).single();
      if (error) throw error;
      const copy = { ...src, id: undefined, created_at: undefined, updated_at: undefined, title: `${src.title} (copy)`, status: "draft" as const };
      delete (copy as Record<string, unknown>).id;
      delete (copy as Record<string, unknown>).created_at;
      delete (copy as Record<string, unknown>).updated_at;
      const { data: ins, error: e2 } = await supabase.from("challenges").insert(copy).select("id").single();
      if (e2) throw e2;
      return ins.id as string;
    },
    onSuccess: (newId) => {
      toast.success("Duplicated");
      qc.invalidateQueries({ queryKey: ["company", "challenges"] });
      navigate({ to: "/company/challenge-builder", search: { id: newId } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = q.data ?? [];

  return (
    <>
      <PageHeader
        title="Your challenges"
        description="Create, edit, publish and manage the challenges your candidates complete."
        actions={<Button asChild><Link to="/company/challenge-builder"><Plus className="mr-1 h-4 w-4" /> New challenge</Link></Button>}
      />
      {q.isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">You haven't created any challenges yet.</p>
          <Button asChild className="mt-4"><Link to="/company/challenge-builder">Create your first challenge</Link></Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((c) => (
            <div key={c.id} className="flex flex-col rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <Badge variant={c.status === "published" ? "default" : "secondary"} className="rounded-full">{c.status}</Badge>
                {c.difficulty && <span className="text-xs text-muted-foreground">{c.difficulty}</span>}
              </div>
              <div className="mt-4 font-semibold line-clamp-2">{c.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{c.role ?? "—"}{c.industry ? ` · ${c.industry}` : ""}</div>
              {(c.evidence_dimensions ?? []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {(c.evidence_dimensions ?? []).slice(0, 3).map((s) => <Badge key={s} variant="outline" className="rounded-full text-[10px]">{s}</Badge>)}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-4 text-xs">
                <Button asChild size="sm" variant="outline"><Link to="/company/challenge-builder" search={{ id: c.id }}>Edit</Link></Button>
                {c.status === "published" ? (
                  <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: c.id, status: "draft" })}>Unpublish</Button>
                ) : c.status === "archived" ? (
                  <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: c.id, status: "draft" })}>Restore</Button>
                ) : (
                  <Button size="sm" onClick={() => setStatus.mutate({ id: c.id, status: "published" })}>Publish</Button>
                )}
                {c.status !== "archived" && <Button size="sm" variant="ghost" onClick={() => setStatus.mutate({ id: c.id, status: "archived" })}>Archive</Button>}
                <Button size="sm" variant="ghost" onClick={() => duplicate.mutate(c.id)}><Copy className="h-3 w-3" /></Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { if (confirm("Delete this challenge? Submissions will be deleted too.")) remove.mutate(c.id); }}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
