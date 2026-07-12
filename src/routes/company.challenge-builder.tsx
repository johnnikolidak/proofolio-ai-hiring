import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Wand2 } from "lucide-react";

export const Route = createFileRoute("/company/challenge-builder")({ component: Builder });

const templates = ["Growth analyst case", "SQL analytics", "Product spec", "Landing page", "Financial model", "Brand story"];

function Builder() {
  return (
    <>
      <PageHeader
        title="Challenge Builder"
        description="Design your challenge with AI. Ship in minutes."
        actions={<><Button variant="outline"><Wand2 className="mr-1 h-4 w-4" />AI draft</Button><Button>Publish</Button></>}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold">Basics</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5"><Label>Title</Label><Input defaultValue="Growth Analyst — Q3 case" /></div>
              <div className="space-y-1.5"><Label>Role</Label><Input defaultValue="Junior Growth Analyst" /></div>
              <div className="space-y-1.5"><Label>Time budget</Label><Select defaultValue="3"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["1", "2", "3", "4", "6"].map((h) => <SelectItem key={h} value={h}>{h} hours</SelectItem>)}</SelectContent>
              </Select></div>
              <div className="space-y-1.5"><Label>Difficulty</Label><Select defaultValue="Intermediate"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Beginner", "Intermediate", "Advanced"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select></div>
              <div className="md:col-span-2 space-y-1.5"><Label>Brief</Label>
                <Textarea rows={5} defaultValue="Northwind is launching a new self-serve tier. Analyze the funnel data and recommend the top 3 conversion improvements. Include reasoning, impact estimates, and next experiments." />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold">Rubric</h3>
            <div className="mt-4 space-y-4">
              {[
                { name: "Analytical depth", weight: 35 },
                { name: "Structured thinking", weight: 25 },
                { name: "Business impact", weight: 25 },
                { name: "Communication", weight: 15 },
              ].map((r) => (
                <div key={r.name}>
                  <div className="flex justify-between text-sm">
                    <span>{r.name}</span>
                    <span className="text-muted-foreground">{r.weight}%</span>
                  </div>
                  <Slider defaultValue={[r.weight]} max={100} className="mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-primary-soft p-5">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="mt-3 font-semibold">AI suggestions</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>· Add a bias-check step to the rubric.</li>
              <li>· Consider a 30-min interview follow-up.</li>
              <li>· Include a sample dataset for realism.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold">Templates</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {templates.map((t) => (
                <Badge key={t} variant="outline" className="cursor-pointer rounded-full hover:border-primary">{t}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
