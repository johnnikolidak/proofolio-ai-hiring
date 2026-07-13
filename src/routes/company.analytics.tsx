import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { LineChart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/company/analytics")({ component: Analytics });

function Analytics() {
  const { user } = useAuth();
  const q = useQuery({
    enabled: !!user?.id,
    queryKey: ["company", "analytics", user?.id],
    queryFn: async () => {
      const [jobs, apps, chals] = await Promise.all([
        supabase.from("jobs").select("id,status", { count: "exact" }).eq("company_id", user!.id),
        supabase.from("applications").select("id,status,job:jobs!inner(company_id)", { count: "exact" }).eq("job.company_id", user!.id),
        supabase.from("challenges").select("id,status", { count: "exact" }).eq("created_by", user!.id),
      ]);
      return {
        jobs: jobs.data ?? [],
        applications: apps.data ?? [],
        challenges: chals.data ?? [],
      };
    },
  });

  if (q.isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const jobsCount = q.data?.jobs.length ?? 0;
  const appsCount = q.data?.applications.length ?? 0;
  const chalsCount = q.data?.challenges.length ?? 0;
  const activeJobs = q.data?.jobs.filter((j) => j.status === "published").length ?? 0;

  const noData = jobsCount === 0 && appsCount === 0 && chalsCount === 0;

  return (
    <>
      <PageHeader title="Analytics" description="Your hiring activity." />
      {noData ? (
        <EmptyState
          icon={LineChart}
          title="No activity yet"
          description="Post a job or create a challenge — analytics fill in as candidates apply and submit."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Published jobs" value={activeJobs} />
          <Stat label="Total jobs" value={jobsCount} />
          <Stat label="Applications" value={appsCount} />
          <Stat label="Challenges" value={chalsCount} />
        </div>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  );
}
