import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatChallengeDuration } from "@/lib/utils";

export const Route = createFileRoute("/candidate/challenges/")({ component: Challenges });

type Attempt = { id: string; challenge_id: string; status: string; submitted_at: string | null; updated_at: string };
type Challenge = { id: string; title: string; role: string | null; difficulty: string | null; duration_hours: number | null; industry: string | null; evidence_dimensions: string[] | null };

function Challenges() {
  const { user } = useAuth();
  const [q, setQ] = useState("");

  const challengesQ = useQuery({
    queryKey: ["candidate", "challenges", "published"],
    queryFn: async () => {
      const { data, error } = await supabase.from("challenges").select("id,title,role,difficulty,duration_hours,industry,evidence_dimensions").eq("status", "published").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Challenge[];
    },
  });

  const attemptsQ = useQuery({
    enabled: !!user?.id,
    queryKey: ["candidate", "attempts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("challenge_attempts").select("id,challenge_id,status,submitted_at,updated_at").eq("candidate_id", user!.id);
      if (error) throw error;
      return (data ?? []) as Attempt[];
    },
  });

  const list = (challengesQ.data ?? []).filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));
  const attemptsById = new Map((attemptsQ.data ?? []).map((a) => [a.challenge_id, a]));
  const inProgress = list.filter((c) => attemptsById.get(c.id)?.status === "in_progress");
  const completed = list.filter((c) => attemptsById.get(c.id)?.status === "submitted");

  return (
    <>
      <PageHeader title="Challenges" description="Real business briefs from real companies." />
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search challenges..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <Tabs defaultValue="all" className="mt-6">
        <TabsList>
          <TabsTrigger value="all">All ({list.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In progress ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <Grid items={list} attempts={attemptsById} loading={challengesQ.isLoading} emptyLabel="No published challenges yet." />
        </TabsContent>
        <TabsContent value="in-progress" className="mt-6">
          <Grid items={inProgress} attempts={attemptsById} loading={attemptsQ.isLoading} emptyLabel="You have no challenges in progress." />
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <Grid items={completed} attempts={attemptsById} loading={attemptsQ.isLoading} emptyLabel="No submitted challenges yet." />
        </TabsContent>
      </Tabs>
    </>
  );
}

function Grid({ items, attempts, loading, emptyLabel }: { items: Challenge[]; attempts: Map<string, Attempt>; loading: boolean; emptyLabel: string }) {
  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (items.length === 0) return <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">{emptyLabel}</div>;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((c) => {
        const a = attempts.get(c.id);
        const cta = a?.status === "submitted" ? "View submission" : a ? "Resume" : "Start";
        return (
          <div key={c.id} className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-elev">
            <div className="flex items-center justify-between">
              {c.difficulty && <Badge variant="secondary" className="rounded-full">{c.difficulty}</Badge>}
              {c.industry && <div className="text-xs text-muted-foreground">{c.industry}</div>}
            </div>
            <h3 className="mt-4 font-semibold">{c.title}</h3>
            {c.role && <div className="text-xs text-muted-foreground">{c.role}</div>}
            {(c.evidence_dimensions ?? []).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(c.evidence_dimensions ?? []).slice(0, 3).map((s) => <Badge key={s} variant="outline" className="rounded-full text-[10px]">{s}</Badge>)}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {formatChallengeDuration(c)}</span>
              <Button asChild size="sm"><Link to="/candidate/challenges/$id" params={{ id: c.id }}>{cta}</Link></Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
