import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Users, X } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/company/jobs")({ component: CompanyJobs });

function CompanyJobs() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const jobsQ = useQuery({
    enabled: !!user?.id,
    queryKey: ["company", "jobs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("owner_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const publish = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: "draft" | "published" }) => {
      const { error } = await supabase.from("jobs").update({ status: next }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["company", "jobs"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["company", "jobs"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Post openings and view applicants."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-1.5 h-4 w-4" /> New job</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>New job posting</DialogTitle></DialogHeader>
              <JobForm defaultCompany={profile?.company_name ?? ""} onDone={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["company", "jobs"] }); }} />
            </DialogContent>
          </Dialog>
        }
      />
      {jobsQ.isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (jobsQ.data ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">No jobs yet. Create your first posting.</div>
      ) : (
        <div className="space-y-3">
          {(jobsQ.data ?? []).map((j) => (
            <div key={j.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{j.title}</div>
                    <Badge variant={j.status === "published" ? "default" : "secondary"} className="rounded-full">{j.status}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{j.company_name}{j.location ? ` · ${j.location}` : ""}{j.remote ? " · Remote" : ""}{j.salary_range ? ` · ${j.salary_range}` : ""}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelected(selected === j.id ? null : j.id)}><Users className="mr-1.5 h-3 w-3" /> Applicants</Button>
                  {j.status === "published" ? (
                    <Button size="sm" variant="outline" onClick={() => publish.mutate({ id: j.id, next: "draft" })}>Unpublish</Button>
                  ) : (
                    <Button size="sm" onClick={() => publish.mutate({ id: j.id, next: "published" })}>Publish</Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete this job?")) remove.mutate(j.id); }}><X className="h-4 w-4" /></Button>
                </div>
              </div>
              {selected === j.id && <Applicants jobId={j.id} />}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Applicants({ jobId }: { jobId: string }) {
  const q = useQuery({
    queryKey: ["applicants", jobId],
    queryFn: async () => {
      const { data: apps, error } = await supabase
        .from("applications")
        .select("id,status,created_at,cover_note,candidate_id")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const ids = (apps ?? []).map((a) => a.candidate_id);
      let profiles: Array<{ id: string; full_name: string | null; headline: string | null; email: string; is_public: boolean }> = [];
      if (ids.length) {
        const { data: pr } = await supabase.from("profiles").select("id,full_name,headline,email,is_public").in("id", ids);
        profiles = (pr ?? []) as typeof profiles;
      }
      const byId = new Map(profiles.map((p) => [p.id, p]));
      return (apps ?? []).map((a) => ({ ...a, profile: byId.get(a.candidate_id) ?? null }));
    },
  });
  if (q.isLoading) return <div className="mt-4 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>;
  const rows = q.data ?? [];
  if (rows.length === 0) return <div className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">No applicants yet.</div>;
  return (
    <div className="mt-4 space-y-2">
      {rows.map((r) => (
        <div key={r.id} className="rounded-lg border border-border p-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-medium">{r.profile?.full_name ?? "Anonymous candidate"}</div>
              <div className="text-xs text-muted-foreground">{r.profile?.headline ?? r.profile?.email}</div>
            </div>
            <Badge variant="secondary" className="rounded-full">{r.status}</Badge>
          </div>
          {r.cover_note && <p className="mt-2 text-xs whitespace-pre-line">{r.cover_note}</p>}
          {r.profile?.is_public && (
            <a href={`/p/${r.profile.id}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-primary underline">View proof profile</a>
          )}
        </div>
      ))}
    </div>
  );
}

function JobForm({ defaultCompany, onDone }: { defaultCompany: string; onDone: () => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "", company_name: defaultCompany, location: "", remote: false, salary_range: "",
    description: "", requirements: "", tags: "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (status: "draft" | "published") => {
    if (!form.title.trim() || !form.company_name.trim()) return toast.error("Title and company are required");
    setSaving(true);
    const { error } = await supabase.from("jobs").insert({
      owner_id: user!.id,
      title: form.title.trim(),
      company_name: form.company_name.trim(),
      location: form.location.trim() || null,
      remote: form.remote,
      salary_range: form.salary_range.trim() || null,
      description: form.description.trim() || null,
      requirements: form.requirements.trim() || null,
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      status,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(status === "published" ? "Job published" : "Draft saved");
    onDone();
  };

  return (
    <div className="space-y-3">
      <F label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Junior Growth Analyst" /></F>
      <div className="grid gap-3 md:grid-cols-2">
        <F label="Company"><Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} /></F>
        <F label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City / Country" /></F>
        <F label="Salary range"><Input value={form.salary_range} onChange={(e) => setForm({ ...form, salary_range: e.target.value })} placeholder="$70–90k" /></F>
        <F label="Tags (comma-separated)"><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="SQL, Analytics" /></F>
      </div>
      <div className="flex items-center gap-3"><Switch checked={form.remote} onCheckedChange={(v) => setForm({ ...form, remote: v })} /><Label className="text-xs">Remote-friendly</Label></div>
      <F label="Description"><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></F>
      <F label="Requirements"><Textarea rows={3} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} /></F>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={() => submit("draft")} disabled={saving}>Save draft</Button>
        <Button onClick={() => submit("published")} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Publish</Button>
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
