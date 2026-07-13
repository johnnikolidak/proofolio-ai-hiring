import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/university/leaderboards")({ component: Boards });

const board = [
  { name: "Sofía Alvarez", score: 94, dimension: "Analytical" },
  { name: "Kenji Watanabe", score: 91, dimension: "Analytical" },
  { name: "Amara Okafor", score: 88, dimension: "Structured thinking" },
  { name: "Diego Ramos", score: 84, dimension: "Execution" },
  { name: "Nora Lindqvist", score: 82, dimension: "Communication" },
];

function Boards() {
  return (
    <>
      <PageHeader title="Leaderboards" description="Ranked by evidence dimensions across all published campus challenges. Never a single misleading score." />
      <div className="grid gap-6 md:grid-cols-2">
        {["Autumn 25 cohort", "All-time"].map((title) => (
          <div key={title} className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">{title}</h3>
              <Badge variant="outline" className="rounded-full"><Trophy className="mr-1 h-3 w-3" /> Live</Badge>
            </div>
            {board.map((r, i) => (
              <div key={r.name} className="flex items-center gap-3 border-t border-border py-2.5 first:border-0 first:pt-0">
                <div className="grid h-6 w-6 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.name}</div>
                  <div className="text-xs text-muted-foreground">Top signal: {r.dimension}</div>
                </div>
                <Badge className="rounded-full">{r.score}</Badge>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
