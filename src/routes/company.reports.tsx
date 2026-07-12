import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileBarChart, Sparkles } from "lucide-react";

export const Route = createFileRoute("/company/reports")({ component: Reports });

const submissions = [
  { name: "Sofía Alvarez", score: 94, breakdown: [{ k: "Analytical", v: 96 }, { k: "Structured", v: 92 }, { k: "Impact", v: 95 }, { k: "Comms", v: 90 }], summary: "Exceptionally clear framing with quantified impact. Strong use of cohort analysis." },
  { name: "Kenji Watanabe", score: 91, breakdown: [{ k: "Analytical", v: 94 }, { k: "Structured", v: 90 }, { k: "Impact", v: 88 }, { k: "Comms", v: 92 }], summary: "Excellent modeling depth. Could sharpen executive summary." },
  { name: "Amara Okafor", score: 88, breakdown: [{ k: "Analytical", v: 84 }, { k: "Structured", v: 92 }, { k: "Impact", v: 86 }, { k: "Comms", v: 92 }], summary: "Great structured thinking. Analytical rigor is a next-step area." },
];

function Reports() {
  return (
    <>
      <PageHeader title="AI Reports" description="Auditable, evidence-linked scoring for every submission." />
      <div className="space-y-5">
        {submissions.map((s) => (
          <div key={s.name} className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"><FileBarChart className="h-5 w-5" /></div>
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-muted-foreground">Growth Analyst — Q3</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-primary">{s.score}</div>
                <Badge variant="secondary" className="rounded-full">AI-scored</Badge>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {s.breakdown.map((b) => (
                <div key={b.k}>
                  <div className="flex justify-between text-xs"><span>{b.k}</span><span className="text-muted-foreground">{b.v}</span></div>
                  <Progress value={b.v} className="mt-1.5 h-1.5" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-secondary/40 p-4">
              <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
              <p className="text-sm">{s.summary}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm">Move to interview</Button>
              <Button size="sm" variant="outline">Open submission</Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
