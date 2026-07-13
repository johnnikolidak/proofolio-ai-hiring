import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/company/library")({
  component: Library,
  head: () => ({ meta: [{ title: "Published Challenges — Proofolio" }] }),
});

function Library() {
  const { user } = useAuth();
  const q = useQuery({
    enabled: !!user?.id,
    queryKey: ["company", "challenges", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("id,title,role,status,difficulty,duration_hours,created_at")
        .eq("created_by", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <>
      <PageHeader
        title="Published Challenges"
        description="Challenges you've created."
        actions={<Button asChild><Link to="/company/challenge-builder"><Plus className="mr-1 h-4 w-4" /> New challenge</Link></Button>}
      />
      {q.isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (q.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No challenges yet"
          description="Build your first challenge to start scoring candidates on real work."
          action={<Button asChild><Link to="/company/challenge-builder">Create a challenge</Link></Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {q.data!.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><BookOpen className="h-5 w-5" /></div>
              <div className="mt-4 font-semibold">{c.title}</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {c.role && <Badge variant="secondary" className="rounded-full">{c.role}</Badge>}
                {c.difficulty && <Badge variant="outline" className="rounded-full">{c.difficulty}</Badge>}
                {c.duration_hours && <Badge variant="outline" className="rounded-full">{c.duration_hours}h</Badge>}
                <Badge variant="outline" className="rounded-full capitalize">{c.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
