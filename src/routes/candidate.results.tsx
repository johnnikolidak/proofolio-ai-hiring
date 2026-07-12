import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/candidate/results")({
  component: Results,
  head: () => ({ meta: [{ title: "Challenge results — Proofolio" }] }),
});

const results = [
  { title: "Growth marketing case — Vela", score: 88, verdict: "Top 8%", strengths: "Structured funnel analysis, sharp copy", improve: "Deepen quantitative modeling" },
  { title: "SQL analytics deep-dive — Northwind", score: 91, verdict: "Top 4%", strengths: "Clean queries, clear narrative", improve: "Add cohort segmentation" },
  { title: "Product spec — Kinetic dashboard", score: 84, verdict: "Top 15%", strengths: "User-centered scope", improve: "Prioritization rubric" },
];

function Results() {
  return (
    <>
      <PageHeader
        title="Challenge results"
        description="AI-graded rubrics from every challenge you've submitted."
      />
      <div className="space-y-4">
        {results.map((r) => (
          <div key={r.title} className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-semibold">{r.title}</div>
                <div className="mt-1 flex items-center gap-2">
                  <Badge className="rounded-full">{r.verdict}</Badge>
                  <span className="text-xs text-muted-foreground">Reviewed by AI + hiring manager</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-semibold tracking-tight">{r.score}</div>
                <div className="text-xs text-muted-foreground">Skill score</div>
              </div>
            </div>
            <Progress value={r.score} className="mt-4 h-1.5" />
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Strengths</div>
                <p className="mt-1 text-sm">{r.strengths}</p>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Improve</div>
                <p className="mt-1 text-sm">{r.improve}</p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Button size="sm" variant="outline">View submission</Button>
              <Button size="sm" variant="ghost"><Sparkles className="mr-1 h-4 w-4" /> Ask AI coach</Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
