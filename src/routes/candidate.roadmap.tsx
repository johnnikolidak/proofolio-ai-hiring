import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, Circle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/candidate/roadmap")({ component: Roadmap });

const skills = [
  { name: "Data analysis", level: 78 },
  { name: "Product thinking", level: 65 },
  { name: "Communication", level: 82 },
  { name: "Technical writing", level: 54 },
  { name: "SQL", level: 71 },
];

const steps = [
  { title: "Foundations", status: "done", items: ["Intro to product", "SQL basics", "Analytics 101"] },
  { title: "Applied skills", status: "current", items: ["Growth marketing case", "Cohort analysis", "AB test design"] },
  { title: "Interview prep", status: "upcoming", items: ["AI mock interviews", "Portfolio review", "Storytelling"] },
  { title: "Job ready", status: "upcoming", items: ["Certificates issued", "Apply to matched roles", "Offer negotiation"] },
];

function Roadmap() {
  return (
    <>
      <PageHeader title="AI Career Roadmap" description="A personalized plan built from your goals and past submissions." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className={`grid h-8 w-8 place-items-center rounded-full ${s.status === "done" ? "bg-success text-success-foreground" : s.status === "current" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {s.status === "done" ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Step {i + 1}</div>
                  <div className="font-semibold">{s.title}</div>
                </div>
                {s.status === "current" && <Badge className="ml-auto rounded-full">In progress</Badge>}
              </div>
              <ul className="mt-4 space-y-2 pl-11 text-sm">
                {s.items.map((it) => (
                  <li key={it} className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-border" /> {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold">Skills</h3>
            <div className="mt-4 space-y-3">
              {skills.map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between text-xs"><span>{s.name}</span><span className="text-muted-foreground">{s.level}</span></div>
                  <Progress value={s.level} className="mt-1.5 h-1.5" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-primary-soft p-5">
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="mt-3 text-sm">Your fastest path to a PM role is to complete two more product cases and pass the interview module.</p>
          </div>
        </div>
      </div>
    </>
  );
}
