import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/university/students")({ component: Students });

const students = [
  { name: "Sofía Alvarez", programme: "MSc Business Analytics", cohort: "Autumn 25", challenges: 4, avg: 94, status: "Top decile" },
  { name: "Kenji Watanabe", programme: "BSc Economics", cohort: "Autumn 25", challenges: 3, avg: 91, status: "Recommended" },
  { name: "Amara Okafor", programme: "MSc Product Management", cohort: "Spring 25", challenges: 5, avg: 88, status: "Recommended" },
  { name: "Diego Ramos", programme: "BSc Computer Science", cohort: "Autumn 25", challenges: 2, avg: 84, status: "Active" },
  { name: "Nora Lindqvist", programme: "MSc Marketing", cohort: "Autumn 25", challenges: 3, avg: 82, status: "Active" },
  { name: "Priya Shah", programme: "BSc Engineering", cohort: "Spring 25", challenges: 1, avg: 76, status: "Needs support" },
];

function Students() {
  const [q, setQ] = useState("");
  const filtered = students.filter((s) => (s.name + s.programme + s.cohort).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Students" description="Your students, ranked by evidence across completed campus challenges." />
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students, programmes, cohorts…" className="pl-9" />
      </div>
      <div className="rounded-xl border border-border bg-card">
        {filtered.map((s) => (
          <div key={s.name} className="flex flex-wrap items-center gap-4 border-b border-border p-4 last:border-0">
            <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary-soft text-primary text-xs font-semibold">{s.name.split(" ").map((x) => x[0]).join("")}</AvatarFallback></Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-muted-foreground">{s.programme} · {s.cohort}</div>
            </div>
            <div className="text-xs text-muted-foreground">{s.challenges} challenges</div>
            <Badge className="rounded-full">Avg {s.avg}</Badge>
            <Badge variant="outline" className="rounded-full">{s.status}</Badge>
            <Button size="sm" variant="outline">Open profile</Button>
          </div>
        ))}
      </div>
    </>
  );
}
