import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Target, Handshake, Award, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/university/")({ component: Overview });

function Overview() {
  const { profile, user } = useAuth();
  const name = profile?.full_name?.split(" ")[0] || profile?.company_name || "there";

  const q = useQuery({
    enabled: !!user?.id,
    queryKey: ["university", "overview", user?.id],
    queryFn: async () => {
      const chals = await supabase.from("challenges").select("id,status").eq("owner_id", user!.id);
      return { challenges: chals.data ?? [] };
    },
  });

  if (q.isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const activeChallenges = q.data?.challenges.filter((c) => c.status === "published").length ?? 0;
  const totalChallenges = q.data?.challenges.length ?? 0;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${name}`}
        description="Your campus programme at a glance."
        actions={<Button asChild><Link to="/university/challenges">Manage challenges</Link></Button>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Active campus challenges" value={activeChallenges} sub={`${totalChallenges} total`} Icon={Target} />
        <Stat label="Employer partnerships" value={0} sub="Managed by Proofolio" Icon={Handshake} />
        <Stat label="Verified certificates" value={0} sub="Coming soon" Icon={Award} />
      </div>
    </>
  );
}

function Stat({ label, value, sub, Icon }: { label: string; value: number; sub?: string; Icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
