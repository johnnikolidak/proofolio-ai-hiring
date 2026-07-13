import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Search = { id?: string };

export const Route = createFileRoute("/company/challenge-builder")({
  component: Builder,
  validateSearch: (s: Record<string, unknown>): Search => ({ id: typeof s.id === "string" ? s.id : undefined }),
  head: () => ({ meta: [{ title: "Challenge Builder — Proofolio" }] }),
});

const schema = z.object({
  title: z.string().trim().min(3, "Title is required").max(160),
  role: z.string().trim().max(120).optional().or(z.literal("")),
  industry: z.string().trim().max(120).optional().or(z.literal("")),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  duration_hours: z.coerce.number().min(0.5).max(48),
  context: z.string().trim().max(4000).optional().or(z.literal("")),
  task: z.string().trim().min(10, "Describe the task").max(4000),
  deliverables: z.string().trim().min(3, "Describe deliverables").max(4000),
  evaluation_criteria: z.string().trim().max(4000).optional().or(z.literal("")),
  evidence_dimensions: z.string().max(500).optional().or(z.literal("")),
});

function Builder() {
  const { user } = useAuth();
  const { id } = useSearch({ from: "/company/challenge-builder" });
  const navigate = useNavigate();
  const qc = useQueryClient();

  const existing = useQuery({
    enabled: !!id,
    queryKey: ["challenge", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("challenges").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [f, setF] = useState({
    title: "", role: "", industry: "", difficulty: "intermediate" as const, duration_hours: "3",
    context: "", task: "", deliverables: "", evaluation_criteria: "", evidence_dimensions: "",
  });

  useEffect(() => {
    if (existing.data) {
      const e = existing.data;
      setF({
        title: e.title ?? "", role: e.role ?? "", industry: e.industry ?? "",
        difficulty: (e.difficulty ?? "intermediate") as never,
        duration_hours: String(e.duration_hours ?? 3),
        context: e.context ?? "", task: e.task ?? "", deliverables: e.deliverables ?? "",
        evaluation_criteria: e.evaluation_criteria ?? "",
        evidence_dimensions: (e.evidence_dimensions ?? []).join(", "),
      });
    }
  }, [existing.data]);

  const save = useMutation({
    mutationFn: async (status: "draft" | "published") => {
      const parsed = schema.safeParse(f);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const payload = {
        owner_id: user!.id,
        title: parsed.data.title,
        role: parsed.data.role || null,
        industry: parsed.data.industry || null,
        difficulty: parsed.data.difficulty,
        duration_hours: parsed.data.duration_hours,
        context: parsed.data.context || null,
        task: parsed.data.task,
        deliverables: parsed.data.deliverables,
        evaluation_criteria: parsed.data.evaluation_criteria || null,
        evidence_dimensions: (parsed.data.evidence_dimensions ?? "").split(",").map((s) => s.trim()).filter(Boolean),
        status,
      };
      if (id) {
        const { error } = await supabase.from("challenges").update(payload).eq("id", id);
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase.from("challenges").insert(payload).select("id").single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (newId, status) => {
      toast.success(status === "published" ? "Challenge published" : "Draft saved");
      qc.invalidateQueries({ queryKey: ["company", "challenges"] });
      qc.invalidateQueries({ queryKey: ["challenge", newId] });
      if (!id) navigate({ to: "/company/challenge-builder", search: { id: newId } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (id && existing.isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <>
      <PageHeader
        title={id ? "Edit challenge" : "New challenge"}
        description="Design a real challenge candidates can complete for evidence-based screening."
        actions={
          <>
            <Button variant="outline" onClick={() => save.mutate("draft")} disabled={save.isPending}>
              {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save draft
            </Button>
            <Button onClick={() => save.mutate("published")} disabled={save.isPending}>Publish</Button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Basics">
            <div className="grid gap-4 md:grid-cols-2">
              <F label="Title *"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Growth Analyst — Q3 case" /></F>
              <F label="Role"><Input value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} placeholder="Junior Growth Analyst" /></F>
              <F label="Industry"><Input value={f.industry} onChange={(e) => setF({ ...f, industry: e.target.value })} placeholder="SaaS" /></F>
              <F label="Difficulty">
                <Select value={f.difficulty} onValueChange={(v) => setF({ ...f, difficulty: v as never })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </F>
              <F label="Estimated hours">
                <Input type="number" min={0.5} step={0.5} value={f.duration_hours} onChange={(e) => setF({ ...f, duration_hours: e.target.value })} />
              </F>
              <F label="Evidence dimensions (comma-separated)">
                <Input value={f.evidence_dimensions} onChange={(e) => setF({ ...f, evidence_dimensions: e.target.value })} placeholder="SQL, Modeling, Communication" />
              </F>
            </div>
          </Card>
          <Card title="Brief">
            <F label="Context"><Textarea rows={4} value={f.context} onChange={(e) => setF({ ...f, context: e.target.value })} placeholder="Set the scene — company, product, situation." /></F>
            <div className="mt-4"><F label="Task *"><Textarea rows={5} value={f.task} onChange={(e) => setF({ ...f, task: e.target.value })} placeholder="What should the candidate do?" /></F></div>
            <div className="mt-4"><F label="Deliverables *"><Textarea rows={3} value={f.deliverables} onChange={(e) => setF({ ...f, deliverables: e.target.value })} placeholder="What should they submit? (doc, deck, link, etc.)" /></F></div>
            <div className="mt-4"><F label="Evaluation criteria"><Textarea rows={3} value={f.evaluation_criteria} onChange={(e) => setF({ ...f, evaluation_criteria: e.target.value })} placeholder="How will the submission be scored?" /></F></div>
          </Card>
        </div>
        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            <div className="font-semibold text-foreground">Status</div>
            <div className="mt-1">{existing.data?.status ?? "not saved yet"}</div>
            <div className="mt-4 font-semibold text-foreground">Publishing rules</div>
            <ul className="mt-1 list-disc pl-4 space-y-1 text-xs">
              <li>Published challenges appear to all candidates on Proofolio.</li>
              <li>Only you (the owner) can edit.</li>
              <li>Submissions of 70+ auto-issue a certificate.</li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-card p-6"><h3 className="font-semibold">{title}</h3><div className="mt-4">{children}</div></div>;
}
