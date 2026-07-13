import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Calendar as CalIcon, Clock } from "lucide-react";

export const Route = createFileRoute("/company/interviews")({ component: Interviews });

const scheduled = [
  { name: "Sofía Alvarez", role: "Growth Analyst", when: "Today · 2:00 PM", panel: ["Amelia C.", "Ravi K."], mode: "Video" },
  { name: "Kenji Watanabe", role: "Growth Analyst", when: "Tomorrow · 10:00 AM", panel: ["Ravi K."], mode: "Video" },
  { name: "Amara Okafor", role: "Product Designer", when: "Fri · 4:30 PM", panel: ["Ines M.", "Amelia C."], mode: "Onsite" },
];

const past = [
  { name: "Liam O'Sullivan", role: "Frontend Eng", when: "Aug 3", outcome: "Advance", score: 88 },
  { name: "Noah Bergman", role: "Data Engineer", when: "Jul 30", outcome: "Hold", score: 76 },
];

function Interviews() {
  return (
    <>
      <PageHeader title="Interviews" description="Structured, AI-assisted interviews with panel scoring." actions={<Button>Schedule</Button>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Upcoming</h3>
          <div className="space-y-3">
            {scheduled.map((s) => (
              <div key={s.name} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{s.name}</div>
                  <Badge variant="secondary" className="rounded-full">{s.mode}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{s.role}</div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><CalIcon className="h-3 w-3" />{s.when}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />45 min</span>
                  <span>Panel: {s.panel.join(", ")}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm"><Video className="mr-1 h-4 w-4" />Join</Button>
                  <Button size="sm" variant="outline">Reschedule</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Past</h3>
          <div className="space-y-3">
            {past.map((p) => (
              <div key={p.name} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.role} · {p.when}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-primary font-semibold">{p.score}</div>
                  <Badge className="rounded-full" variant={p.outcome === "Advance" ? "default" : "secondary"}>{p.outcome}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
