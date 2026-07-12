import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export const Route = createFileRoute("/company/shortlists")({
  component: Shortlists,
  head: () => ({ meta: [{ title: "Shortlists — Proofolio" }] }),
});

const shortlists = [
  {
    name: "Growth Analyst — Q3",
    stage: "Interview",
    people: [
      { name: "Sofía Alvarez", score: 94, note: "Top decile. Sharp narrative." },
      { name: "Kenji Watanabe", score: 91, note: "Excellent modeling." },
      { name: "Amara Okafor", score: 88, note: "Clean structured thinking." },
    ],
  },
  {
    name: "Associate PM",
    stage: "Review",
    people: [
      { name: "Diego Ramos", score: 92, note: "Great customer discovery." },
      { name: "Nora Lindqvist", score: 89, note: "Very fast iteration." },
    ],
  },
];

function Shortlists() {
  return (
    <>
      <PageHeader title="Shortlists" description="Your curated candidate pools per campaign." />
      <div className="space-y-6">
        {shortlists.map((s) => (
          <div key={s.name} className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{s.people.length} candidates · Stage: {s.stage}</div>
              </div>
              <Button size="sm" variant="outline">Share shortlist</Button>
            </div>
            <div>
              {s.people.map((p) => (
                <div key={p.name} className="flex items-center gap-4 border-b border-border p-4 last:border-0">
                  <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary-soft text-primary text-xs font-semibold">{p.name.split(" ").map((x) => x[0]).join("")}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.note}</div>
                  </div>
                  <Badge className="rounded-full"><Star className="mr-1 h-3 w-3" /> {p.score}</Badge>
                  <Button size="sm" variant="outline">Open</Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
