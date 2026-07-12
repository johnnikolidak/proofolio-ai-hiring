import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Building2, MapPin, Loader2, Search } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/candidate/jobs")({ component: Jobs });

type Job = { id: string; title: string; company_name: string; location: string | null; remote: boolean; salary_range: string | null; tags: string[]; description: string | null };

function Jobs() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const jobsQ = useQuery({
    queryKey: ["jobs", "published"],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("id,title,company_name,location,remote,salary_range,tags,description").eq("status", "published").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Job[];
    },
  });
  const appsQ = useQuery({
    enabled: !!user?.id,
    queryKey: ["candidate", "applications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("job_id").eq("candidate_id", user!.id);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.job_id));
    },
  });

  const jobs = (jobsQ.data ?? []).filter((j) => (j.title + " " + j.company_name + " " + (j.location ?? "")).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader title="Jobs" description="Real openings from companies on Proofolio." />
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search jobs…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {jobsQ.isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">No published jobs yet. Check back soon.</div>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => (
            <div key={j.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Building2 className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{j.title}</div>
                <div className="text-xs text-muted-foreground">{j.company_name}{j.location ? <> · <MapPin className="mr-0.5 inline h-3 w-3" />{j.location}</> : null}{j.remote ? " · Remote" : ""}{j.salary_range ? ` · ${j.salary_range}` : ""}</div>
                {j.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{j.tags.map((t) => <Badge key={t} variant="outline" className="rounded-full">{t}</Badge>)}</div>}
              </div>
              {appsQ.data?.has(j.id) ? (
                <Badge variant="secondary" className="rounded-full">Applied</Badge>
              ) : (
                <Button asChild><Link to="/candidate/jobs/$id" params={{ id: j.id }}>View & apply</Link></Button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
