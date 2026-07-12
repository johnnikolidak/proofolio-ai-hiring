import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search } from "lucide-react";

export const Route = createFileRoute("/company/candidates")({ component: Candidates });

const candidates = [
  { name: "Sofía Alvarez", role: "Growth Analyst", score: 94, stage: "Interview", loc: "Madrid", tags: ["SQL", "Analytics"] },
  { name: "Kenji Watanabe", role: "Growth Analyst", score: 91, stage: "AI-scored", loc: "Tokyo", tags: ["Modeling"] },
  { name: "Amara Okafor", role: "Product Designer", score: 88, stage: "Shortlisted", loc: "Lagos", tags: ["UX", "Figma"] },
  { name: "Liam O'Sullivan", role: "Frontend Eng", score: 85, stage: "AI-scored", loc: "Dublin", tags: ["React"] },
  { name: "Priya Patel", role: "Growth Analyst", score: 83, stage: "AI-scored", loc: "Mumbai", tags: ["Growth"] },
  { name: "Noah Bergman", role: "Data Engineer", score: 82, stage: "Shortlisted", loc: "Stockholm", tags: ["Python"] },
  { name: "Camila Ribeiro", role: "Product Designer", score: 80, stage: "Shortlisted", loc: "São Paulo", tags: ["UX"] },
  { name: "Yusuf Demir", role: "Frontend Eng", score: 78, stage: "AI-scored", loc: "Istanbul", tags: ["TypeScript"] },
];

function Candidates() {
  return (
    <>
      <PageHeader title="Candidates" description="Every submission, ranked and searchable." actions={<Button variant="outline">Export CSV</Button>} />
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search candidates..." className="pl-9" />
        </div>
        <Button variant="outline">All campaigns</Button>
        <Button variant="outline">All stages</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {candidates.map((c) => (
          <div key={c.name} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
            <Avatar className="h-11 w-11">
              <AvatarFallback className="bg-primary-soft text-primary text-xs font-semibold">
                {c.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground">{c.role} · {c.loc}</div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {c.tags.map((t) => <Badge key={t} variant="outline" className="rounded-full text-[10px]">{t}</Badge>)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-semibold text-primary">{c.score}</div>
              <Badge variant="secondary" className="rounded-full text-[10px]">{c.stage}</Badge>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
