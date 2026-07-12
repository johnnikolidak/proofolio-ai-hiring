import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/university/challenges")({ component: Challenges });

type Row = {
  id: string;
  title: string;
  role: string | null;
  industry: string | null;
  difficulty: string | null;
  duration_hours: number | null;
  status: string;
  created_at: string;
};

const schema = z.object({
  title: z.string().trim().min(3).max(160),
  role: z.string().trim().max(120).optional().or(z.literal("")),
  industry: z.string().trim().max(120).optional().or(z.literal("")),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  duration_hours: z.coerce.number().min(0.5).max(40),
  context: z.string().trim().max(2000).optional().or(z.literal("")),
  task: z.string().trim().max(2000).optional().or(z.literal("")),
  deliverables: z.string().trim().max(2000).optional().or(z.literal("")),
  evaluation_criteria: z.string().trim().max(2000).optional().or(z.literal("")),
});

function Challenges() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("challenges")
      .select("id,title,role,industry,difficulty,duration_hours,status,created_at")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) return toast.error(error.message);
    setRows((data as Row[]) ?? []);
  };
  useEffect(() => { void load(); }, []);

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return toast.error(parsed.error.issues[0]!.message);
    setSaving(true);
    const publish = (fd.get("_publish") as string) === "1";
    const { error } = await supabase.from("challenges").insert({
      owner_id: user.id,
      title: parsed.data.title,
      role: parsed.data.role || null,
      industry: parsed.data.industry || null,
      difficulty: parsed.data.difficulty,
      duration_hours: parsed.data.duration_hours,
      context: parsed.data.context || null,
      task: parsed.data.task || null,
      deliverables: parsed.data.deliverables || null,
      evaluation_criteria: parsed.data.evaluation_criteria || null,
      status: publish ? "published" : "draft",
      evidence_dimensions: ["Critical thinking", "Communication", "Problem-solving"],
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(publish ? "Challenge published" : "Draft saved");
    setOpen(false);
    void load();
  };

  const toggleStatus = async (row: Row) => {
    const next = row.status === "published" ? "archived" : "published";
    const { error } = await supabase.from("challenges").update({ status: next }).eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success(next === "published" ? "Published" : "Archived");
    void load();
  };

  const filtered = rows.filter((r) => r.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader
        title="Campus Challenges"
        description="Design and manage challenges for your students. Publish to make them visible to eligible candidates."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" /> New challenge</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>New campus challenge</DialogTitle></DialogHeader>
              <form onSubmit={create} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2 space-y-1.5"><Label>Title</Label><Input name="title" required placeholder="Growth Analyst — Cohort teardown" /></div>
                  <div className="space-y-1.5"><Label>Role</Label><Input name="role" placeholder="Analyst" /></div>
                  <div className="space-y-1.5"><Label>Industry</Label><Input name="industry" placeholder="SaaS" /></div>
                  <div className="space-y-1.5">
                    <Label>Difficulty</Label>
                    <Select name="difficulty" defaultValue="intermediate">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Duration (hours)</Label><Input name="duration_hours" type="number" step="0.5" defaultValue={3} required /></div>
                </div>
                <div className="space-y-1.5"><Label>Business context</Label><Textarea name="context" rows={2} /></div>
                <div className="space-y-1.5"><Label>Candidate task</Label><Textarea name="task" rows={2} /></div>
                <div className="space-y-1.5"><Label>Deliverables</Label><Textarea name="deliverables" rows={2} /></div>
                <div className="space-y-1.5"><Label>Evaluation criteria</Label><Textarea name="evaluation_criteria" rows={2} /></div>
                <DialogFooter className="gap-2">
                  <Button type="submit" name="_publish" value="0" variant="outline" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save draft</Button>
                  <Button type="submit" name="_publish" value="1" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Publish</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search challenges…" className="pl-9" />
      </div>

      <div className="rounded-xl border border-border bg-card">
        {loading ? (
          <div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No challenges yet. Click <b>New challenge</b> to create your first one.
          </div>
        ) : (
          filtered.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-4 border-b border-border p-4 last:border-0">
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{r.title}</div>
                <div className="mt-0.5 flex flex-wrap gap-1.5">
                  {r.role && <Badge variant="secondary" className="rounded-full">{r.role}</Badge>}
                  {r.difficulty && <Badge variant="outline" className="rounded-full capitalize">{r.difficulty}</Badge>}
                  {r.duration_hours && <Badge variant="outline" className="rounded-full">{r.duration_hours}h</Badge>}
                </div>
              </div>
              <Badge className={`rounded-full ${r.status === "published" ? "" : "bg-muted text-muted-foreground"}`}>{r.status}</Badge>
              <Button size="sm" variant="outline" onClick={() => toggleStatus(r)}>{r.status === "published" ? "Archive" : "Publish"}</Button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
