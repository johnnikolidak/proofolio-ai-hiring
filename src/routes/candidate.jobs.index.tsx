import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck, Building2, Loader2, MapPin, Search } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/candidate/jobs/")({ component: Jobs });

type Job = {
  id: string;
  title: string;
  company_name: string;
  location: string | null;
  remote: boolean;
  salary_range: string | null;
  tags: string[];
  description: string | null;
};

function Jobs() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);

  const jobsQ = useQuery({
    queryKey: ["jobs", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id,title,company_name,location,remote,salary_range,tags,description")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Job[];
    },
  });
  const appsQ = useQuery({
    enabled: !!user?.id,
    queryKey: ["candidate", "applications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("job_id,status").eq("candidate_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });
  const savedQ = useQuery({
    enabled: !!user?.id,
    queryKey: ["candidate", "saved_jobs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_jobs").select("job_id").eq("candidate_id", user!.id);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.job_id));
    },
  });

  const toggleSave = useMutation({
    mutationFn: async (job_id: string) => {
      const isSaved = savedQ.data?.has(job_id);
      if (isSaved) {
        const { error } = await supabase.from("saved_jobs").delete().eq("candidate_id", user!.id).eq("job_id", job_id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("saved_jobs").insert({ candidate_id: user!.id, job_id });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidate", "saved_jobs"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const appliedIds = useMemo(() => new Set((appsQ.data ?? []).filter((a) => a.status !== "withdrawn").map((a) => a.job_id)), [appsQ.data]);
  const savedIds = savedQ.data ?? new Set<string>();

  const all = (jobsQ.data ?? []).filter((j) => {
    if (remoteOnly && !j.remote) return false;
    const s = (j.title + " " + j.company_name + " " + (j.location ?? "") + " " + j.tags.join(" ")).toLowerCase();
    return s.includes(q.toLowerCase());
  });
  const saved = all.filter((j) => savedIds.has(j.id));

  return (
    <>
      <PageHeader title="Jobs" description="Real openings from companies on Proofolio." />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search title, company, tag…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button variant={remoteOnly ? "default" : "outline"} size="sm" onClick={() => setRemoteOnly((v) => !v)}>Remote only</Button>
      </div>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All jobs ({all.length})</TabsTrigger>
          <TabsTrigger value="saved">Saved ({saved.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <JobList jobs={all} loading={jobsQ.isLoading} applied={appliedIds} saved={savedIds} onToggleSave={(id) => toggleSave.mutate(id)} />
        </TabsContent>
        <TabsContent value="saved" className="mt-6">
          <JobList jobs={saved} loading={savedQ.isLoading} applied={appliedIds} saved={savedIds} onToggleSave={(id) => toggleSave.mutate(id)} emptyLabel="No saved jobs yet — tap the bookmark to save." />
        </TabsContent>
      </Tabs>
    </>
  );
}

function JobList({ jobs, loading, applied, saved, onToggleSave, emptyLabel }: { jobs: Job[]; loading: boolean; applied: Set<string>; saved: Set<string>; onToggleSave: (id: string) => void; emptyLabel?: string }) {
  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (jobs.length === 0) return <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">{emptyLabel ?? "No published jobs yet."}</div>;
  return (
    <div className="space-y-3">
      {jobs.map((j) => (
        <div key={j.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Building2 className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold">{j.title}</div>
            <div className="text-xs text-muted-foreground">
              {j.company_name}
              {j.location ? <> · <MapPin className="mr-0.5 inline h-3 w-3" />{j.location}</> : null}
              {j.remote ? " · Remote" : ""}
              {j.salary_range ? ` · ${j.salary_range}` : ""}
            </div>
            {j.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{j.tags.map((t) => <Badge key={t} variant="outline" className="rounded-full">{t}</Badge>)}</div>}
          </div>
          <Button
            size="icon"
            variant="ghost"
            aria-label={saved.has(j.id) ? "Unsave" : "Save"}
            onClick={() => onToggleSave(j.id)}
          >
            {saved.has(j.id) ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
          </Button>
          {applied.has(j.id) ? (
            <Badge variant="secondary" className="rounded-full">Applied</Badge>
          ) : (
            <Button asChild><Link to="/candidate/jobs/$id" params={{ id: j.id }}>View & apply</Link></Button>
          )}
        </div>
      ))}
    </div>
  );
}
