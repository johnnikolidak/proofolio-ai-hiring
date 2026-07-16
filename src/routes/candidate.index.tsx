import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, Award, Bot, Sparkles, Target, TrendingUp, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/candidate/")({
  component: Overview,
  head: () => ({ meta: [{ title: "Overview — Proofolio" }] }),
});

function Overview() {
  const { user, profile } = useAuth();
  const firstName = (profile?.full_name || profile?.email || "").split(" ")[0] || "there";

  const submissionsQ = useQuery({
    queryKey: ["candidate", "submissions", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("id,status,created_at")
        .eq("candidate_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const attemptsQ = useQuery({
    queryKey: ["candidate", "attempts-overview", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenge_attempts")
        .select("id,status")
        .eq("candidate_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const certsQ = useQuery({
    queryKey: ["candidate", "certificates-count", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("certificates")
        .select("id", { count: "exact", head: true })
        .eq("candidate_id", user!.id);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const subs = submissionsQ.data ?? [];
  const attempts = attemptsQ.data ?? [];
  const inProgress = attempts.filter((a) => a.status === "in_progress").length;
  const submitted = subs.filter((s) => s.status === "submitted" || s.status === "reviewed").length;
  const certificates = certsQ.data ?? 0;

  const stats = [
    { label: "Profile", value: profile?.full_name ? "Set up" : "Incomplete", delta: profile?.full_name ? "Add work & skills next" : "Add your name & bio", Icon: User },
    { label: "Challenges in progress", value: String(inProgress), delta: inProgress ? "Keep going" : "Browse to start", Icon: Target },
    { label: "Submissions", value: String(submitted), delta: submitted ? "Awaiting review" : "None yet", Icon: TrendingUp },
    { label: "Certificates", value: String(certificates), delta: certificates ? "View & share" : "Earn from challenges", Icon: Award },
  ];

  const profileCompletion = (() => {
    let n = 0;
    if (profile?.full_name) n += 40;
    if (profile?.email) n += 20;
    if (profile?.avatar_url) n += 20;
    if (profile?.company_name) n += 20;
    return Math.min(100, n);
  })();

  return (
    <>
      <PageHeader
        title={`Welcome, ${firstName}`}
        description="Here's what's happening in your career today."
        actions={<Button asChild><Link to="/candidate/challenges">Browse challenges</Link></Button>}
      />
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-semibold">{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Profile completion</h2>
            <Link to="/candidate/profile" className="text-xs text-primary hover:underline">Edit profile</Link>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm"><span>{profileCompletion}% complete</span><span className="text-muted-foreground">Recommended: 100%</span></div>
            <Progress value={profileCompletion} className="mt-2 h-2" />
          </div>

          <div className="mt-8">
            <h3 className="font-semibold">Recent activity</h3>
            {submissionsQ.isLoading ? (
              <div className="mt-4 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">Loading…</div>
            ) : subs.length === 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No activity yet. Start a challenge to build your Proof Profile.
                <div className="mt-3">
                  <Button asChild size="sm"><Link to="/candidate/challenges">Browse challenges</Link></Button>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {subs.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-4 text-sm">
                    <div>
                      <div className="font-medium">Submission</div>
                      <div className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</div>
                    </div>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{s.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-gradient-to-br from-primary to-[oklch(0.55_0.22_285)] p-6 text-primary-foreground">
          <Sparkles className="h-6 w-6" />
          <h3 className="mt-3 font-semibold">Your next best move</h3>
          <p className="mt-1 text-sm opacity-90">
            {profileCompletion < 100
              ? "Finish setting up your Proof Profile so employers can find you."
              : "Pick a challenge that matches your target role and start earning evidence."}
          </p>
          <Button asChild variant="secondary" className="mt-5 w-full">
            <Link to={profileCompletion < 100 ? "/candidate/profile" : "/candidate/challenges"}>
              {profileCompletion < 100 ? "Complete profile" : "Browse challenges"} <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <div className="mt-6 border-t border-primary-foreground/20 pt-4">
            <div className="flex items-center gap-2 text-sm"><Bot className="h-4 w-4" /> AI Interview coach</div>
            <p className="mt-1 text-xs opacity-80">Practice interview questions tailored to your target role.</p>
            <Button asChild size="sm" variant="ghost" className="mt-3 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/candidate/interview">Start practice →</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
