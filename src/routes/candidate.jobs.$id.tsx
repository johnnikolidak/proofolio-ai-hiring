import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Building2, CheckCircle2, Loader2, MapPin } from "lucide-react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/candidate/jobs/$id")({ component: JobDetail });

function JobDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [note, setNote] = useState("");

  const jobQ = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", id).eq("status", "published").maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const appQ = useQuery({
    enabled: !!user?.id,
    queryKey: ["application", id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*").eq("candidate_id", user!.id).eq("job_id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const profileQ = useQuery({
    enabled: !!user?.id,
    queryKey: ["profile-mini", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("full_name,headline,completion_pct,is_public").eq("id", user!.id).single();
      if (error) throw error;
      return data;
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!profileQ.data?.full_name) throw new Error("Add your name to your Proof Profile before applying.");
      const { error } = await supabase.from("applications").insert({ job_id: id, candidate_id: user!.id, cover_note: note || null });
      if (error) {
        if (error.code === "23505") throw new Error("You've already applied to this job.");
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Application submitted");
      qc.invalidateQueries({ queryKey: ["application", id] });
      qc.invalidateQueries({ queryKey: ["candidate", "applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (jobQ.isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!jobQ.data) return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <p className="text-sm text-muted-foreground">Job not found or no longer published.</p>
      <Button asChild variant="outline" className="mt-4"><Link to="/candidate/jobs"><ArrowLeft className="mr-1.5 h-4 w-4" />Back to jobs</Link></Button>
    </div>
  );
  const j = jobQ.data;
  const alreadyApplied = !!appQ.data;

  return (
    <>
      <PageHeader
        title={j.title}
        description={j.company_name}
        actions={<Button asChild variant="outline" size="sm" onClick={() => navigate({ to: "/candidate/jobs" })}><Link to="/candidate/jobs"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back</Link></Button>}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" /> {j.company_name}
              {j.location && <><span>·</span><MapPin className="h-3 w-3" /> {j.location}</>}
              {j.remote && <span>· Remote</span>}
              {j.salary_range && <span>· {j.salary_range}</span>}
            </div>
            {j.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{j.tags.map((t: string) => <Badge key={t} variant="outline" className="rounded-full">{t}</Badge>)}</div>}
            {j.description && <div className="mt-4"><h3 className="font-semibold">About the role</h3><p className="mt-2 whitespace-pre-line text-sm">{j.description}</p></div>}
            {j.requirements && <div className="mt-4"><h3 className="font-semibold">What we're looking for</h3><p className="mt-2 whitespace-pre-line text-sm">{j.requirements}</p></div>}
          </div>
        </div>

        <aside>
          <div className="rounded-xl border border-border bg-card p-6">
            {alreadyApplied ? (
              <div className="text-center">
                <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-success/15 text-success"><CheckCircle2 className="h-5 w-5" /></div>
                <h3 className="mt-3 font-semibold">Application submitted</h3>
                <p className="mt-1 text-xs text-muted-foreground">Status: {appQ.data?.status}</p>
                <Button asChild variant="outline" size="sm" className="mt-4 w-full"><Link to="/candidate/applications">View your applications</Link></Button>
              </div>
            ) : (
              <>
                <h3 className="font-semibold">Apply with your Proof Profile</h3>
                <p className="mt-1 text-xs text-muted-foreground">Your profile ({profileQ.data?.completion_pct ?? 0}% complete) and any submitted challenge work will be shared with {j.company_name}.</p>
                <div className="mt-4">
                  <label className="text-xs font-medium">Cover note (optional)</label>
                  <Textarea rows={5} value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} placeholder={`Why you're a great fit for ${j.company_name}…`} />
                </div>
                <Button className="mt-3 w-full" onClick={() => applyMutation.mutate()} disabled={applyMutation.isPending}>
                  {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit application
                </Button>
                {!profileQ.data?.is_public && <p className="mt-3 text-[11px] text-muted-foreground">Tip: turn on the public profile toggle so employers can see your work directly.</p>}
              </>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
