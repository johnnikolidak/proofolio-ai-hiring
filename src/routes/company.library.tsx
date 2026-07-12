import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Plus, Search } from "lucide-react";

export const Route = createFileRoute("/company/library")({
  component: Library,
  head: () => ({ meta: [{ title: "Challenge Library — Proofolio" }] }),
});

const library = [
  { title: "Growth Analyst — Cohort teardown", role: "Growth", time: "3 hr", uses: 42, level: "Intermediate" },
  { title: "SQL analytics — Retention query", role: "Data", time: "2 hr", uses: 128, level: "Beginner" },
  { title: "Product spec — Dashboard v2", role: "Product", time: "4 hr", uses: 31, level: "Advanced" },
  { title: "Frontend — Component API", role: "Engineering", time: "3 hr", uses: 76, level: "Intermediate" },
  { title: "Customer success — QBR deck", role: "CS", time: "2 hr", uses: 19, level: "Beginner" },
  { title: "Ops — Process design", role: "Ops", time: "2 hr", uses: 24, level: "Intermediate" },
];

function Library() {
  return (
    <>
      <PageHeader
        title="Challenge Library"
        description="Ready-made challenges vetted by our team. Clone and customize in one click."
        actions={<Button asChild><Link to="/company/challenge-builder"><Plus className="mr-1 h-4 w-4" /> Build custom</Link></Button>}
      />
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search challenges…" className="pl-9" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {library.map((c) => (
          <div key={c.title} className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-elev">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="mt-4 font-semibold">{c.title}</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="rounded-full">{c.role}</Badge>
              <Badge variant="outline" className="rounded-full">{c.level}</Badge>
              <Badge variant="outline" className="rounded-full">{c.time}</Badge>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Used by {c.uses} teams</div>
              <Button size="sm" variant="outline">Clone</Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
