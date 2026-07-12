import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Clock, Search, Star } from "lucide-react";

export const Route = createFileRoute("/candidate/challenges")({ component: Challenges });

const challenges = [
  { title: "Growth marketing case", company: "Vela", skills: ["SEO", "Analytics"], time: "3 hr", level: "Intermediate", rating: 4.8 },
  { title: "SQL analytics deep-dive", company: "Northwind", skills: ["SQL", "Data viz"], time: "2 hr", level: "Beginner", rating: 4.9 },
  { title: "Product spec — dashboard v2", company: "Kinetic", skills: ["Product", "UX"], time: "4 hr", level: "Advanced", rating: 4.7 },
  { title: "React landing page", company: "Lumen", skills: ["React", "Tailwind"], time: "3 hr", level: "Intermediate", rating: 4.6 },
  { title: "Financial model — SaaS", company: "Foundry", skills: ["Excel", "Finance"], time: "5 hr", level: "Advanced", rating: 4.9 },
  { title: "Brand story — DTC", company: "Acme", skills: ["Copy", "Brand"], time: "2 hr", level: "Beginner", rating: 4.5 },
];

function Challenges() {
  return (
    <>
      <PageHeader title="Challenges" description="Real business briefs from real companies." />
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search challenges..." className="pl-9" />
        </div>
        <Button variant="outline">Filter</Button>
        <Button variant="outline">Sort: Recommended</Button>
      </div>
      <Tabs defaultValue="all" className="mt-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="in-progress">In progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {challenges.map((c) => (
              <div key={c.title} className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-elev">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="rounded-full">{c.level}</Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><Star className="h-3 w-3 fill-primary text-primary" /> {c.rating}</div>
                </div>
                <h3 className="mt-4 font-semibold">{c.title}</h3>
                <div className="text-xs text-muted-foreground">{c.company}</div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {c.skills.map((s) => <Badge key={s} variant="outline" className="rounded-full">{s}</Badge>)}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {c.time}</span>
                  <Button size="sm">Start</Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="in-progress"><EmptyState label="You have 3 in-progress challenges" /></TabsContent>
        <TabsContent value="completed"><EmptyState label="You have completed 12 challenges" /></TabsContent>
      </Tabs>
    </>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">{label}</div>;
}
