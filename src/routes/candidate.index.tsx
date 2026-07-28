import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowUpRight, Award, Bot, CheckCircle2, Sparkles, Target, TrendingUp, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/candidate/")({
  component: Overview,
  head: () => ({ meta: [{ title: "Overview — Proofolio" }] }),
});

function Overview() {
  const { user, profile } = useAuth();
  const firstName = (profile?.full_name || profile?.email || "").split(" ")[0] || "there";
  const completion = profile?.completion_pct ?? 0;

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

  const subs = submissionsQ.data ?? [];
  const inProgress = subs.filter((s) => s.status === "in_progress").length;
  const submitted = subs.filter((s) => s.status === "submitted" || s.status === "reviewed").length;

  const stats = [
    { label: "Profile", value: `${completion}%`, delta: completion < 100 ? "Finish it up" : "All set", Icon: User },
    { label: "Challenges in progress", value: String(inProgress), delta: inProgress ? "Keep going" : "Browse to start", Icon: Target },
    { label: "Submissions", value: String(submitted), delta: submitted ? "Awaiting review" : "None yet", Icon: TrendingUp },
    { label: "Certificates", value: "0", delta: "Earn from challenges", Icon: Award },
  ];

  return (
    <>
      <ProfileCompletionCard completion={completion} />

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

        <div className="rounded-xl border border-border bg-gradient-to-br from-primary to-[oklch(0.55_0.22_285)] p-6 text-primary-foreground">
          <Sparkles className="h-6 w-6" />
          <h3 className="mt-3 font-semibold">Your next best move</h3>
          <p className="mt-1 text-sm opacity-90">Pick a challenge that matches your target role and start earning evidence.</p>
          <Button asChild variant="secondary" className="mt-5 w-full">
            <Link to="/candidate/challenges">Browse challenges <ArrowUpRight className="ml-1 h-4 w-4" /></Link>
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

function ProfileCompletionCard({ completion }: { completion: number }) {
  if (completion >= 100) {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 px-5 py-4">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
        <div>
          <div className="text-sm font-semibold text-foreground">✅ Profile Complete</div>
          <div className="text-xs text-muted-foreground">You're ready to receive invitations from companies.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary to-[oklch(0.55_0.22_285)] p-6 text-primary-foreground shadow-elev md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold tracking-tight md:text-xl">Complete your profile to unlock future opportunities.</h2>
          <div className="mt-5 max-w-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Profile Completion</span>
              <span className="font-semibold">{completion}%</span>
            </div>
            <Progress value={completion} className="mt-2 h-2.5 bg-primary-foreground/20 [&>div]:bg-primary-foreground" />
          </div>
          <p className="mt-4 text-sm opacity-90">Finish your profile to improve your visibility for recruiters.</p>
        </div>
        <Button asChild size="lg" variant="secondary" className="shrink-0 md:self-center">
          <Link to="/onboarding">Complete Profile <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}
