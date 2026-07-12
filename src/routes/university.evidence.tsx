import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/university/evidence")({ component: Evidence });

const dims = [
  { name: "Critical thinking", value: 84, delta: "+6 vs last cohort" },
  { name: "Communication", value: 78, delta: "+11 vs last cohort" },
  { name: "Problem-solving", value: 81, delta: "+3 vs last cohort" },
  { name: "Commercial awareness", value: 66, delta: "-2 vs last cohort" },
  { name: "Creativity", value: 74, delta: "+8 vs last cohort" },
  { name: "Collaboration", value: 88, delta: "+4 vs last cohort" },
  { name: "Execution quality", value: 79, delta: "+5 vs last cohort" },
];

function Evidence() {
  return (
    <>
      <PageHeader title="Evidence Dimensions" description="How your cohort performs across the seven signals we track from every submission." />
      <div className="grid gap-5 md:grid-cols-2">
        {dims.map((d) => (
          <div key={d.name} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="font-medium">{d.name}</div>
              <div className="text-lg font-semibold text-primary">{d.value}</div>
            </div>
            <Progress value={d.value} className="mt-3 h-1.5" />
            <div className="mt-2 text-xs text-muted-foreground">{d.delta}</div>
          </div>
        ))}
      </div>
    </>
  );
}
