import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin } from "lucide-react";

export const Route = createFileRoute("/candidate/jobs")({ component: Jobs });

const jobs = [
  { role: "Junior Growth Analyst", company: "Northwind Labs", location: "Remote", salary: "$70–90k", tags: ["Analytics", "SQL"], match: 92 },
  { role: "Associate PM", company: "Lumen", location: "Berlin", salary: "€60–75k", tags: ["Product", "UX"], match: 88 },
  { role: "Data Analyst Intern", company: "Foundry", location: "Remote", salary: "$28/hr", tags: ["Python", "SQL"], match: 84 },
  { role: "Marketing Associate", company: "Vela", location: "NYC", salary: "$65k", tags: ["Growth", "Copy"], match: 79 },
  { role: "Frontend Engineer I", company: "Kinetic", location: "Remote", salary: "$85–110k", tags: ["React", "TS"], match: 76 },
];

function Jobs() {
  return (
    <>
      <PageHeader title="Jobs" description="Roles matched to your skill profile." />
      <div className="space-y-3">
        {jobs.map((j) => (
          <div key={j.role} className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Building2 className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{j.role}</div>
              <div className="text-xs text-muted-foreground">{j.company} · <MapPin className="mr-0.5 inline h-3 w-3" />{j.location} · {j.salary}</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {j.tags.map((t) => <Badge key={t} variant="outline" className="rounded-full">{t}</Badge>)}
              </div>
            </div>
            <Badge className="rounded-full">{j.match}% match</Badge>
            <Button>Apply</Button>
          </div>
        ))}
      </div>
    </>
  );
}
