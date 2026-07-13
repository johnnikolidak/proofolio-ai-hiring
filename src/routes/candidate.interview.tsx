import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Mic, Play } from "lucide-react";

export const Route = createFileRoute("/candidate/interview")({ component: Interview });

const sessions = [
  { role: "Growth Analyst — Northwind", score: 87, date: "Yesterday", strengths: "Structured storytelling", improve: "Quantify impact" },
  { role: "PM — Lumen", score: 79, date: "3 days ago", strengths: "Product sense", improve: "Prioritization frameworks" },
  { role: "Data Analyst — Foundry", score: 82, date: "1 week ago", strengths: "Technical depth", improve: "Executive summary" },
];

function Interview() {
  return (
    <>
      <PageHeader
        title="AI Interview"
        description="Adaptive practice interviews tailored to your target role."
        actions={<Button><Play className="mr-1 h-4 w-4" /> Start new session</Button>}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold">Meet your interviewer</div>
              <div className="text-xs text-muted-foreground">Adaptive AI · voice + text · feedback in real time</div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {[
              { who: "AI", msg: "Tell me about a time you influenced a decision without authority." },
              { who: "You", msg: "At my last internship at Vela, our team was debating a pricing change..." },
              { who: "AI", msg: "Great use of the STAR framework. Can you quantify the outcome?" },
            ].map((m, i) => (
              <div key={i} className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m.who === "AI" ? "bg-secondary" : "ml-auto bg-primary text-primary-foreground"}`}>
                {m.msg}
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3 rounded-full border border-border p-2">
            <button className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground"><Mic className="h-4 w-4" /></button>
            <div className="flex-1 text-sm text-muted-foreground">Hold to answer, or type below...</div>
            <Button size="sm">Send</Button>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Recent sessions</h3>
          <div className="mt-3 space-y-3">
            {sessions.map((s) => (
              <div key={s.role} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{s.role}</div>
                  <Badge className="rounded-full">{s.score}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{s.date}</div>
                <div className="mt-3 text-xs"><span className="text-success">Strength:</span> {s.strengths}</div>
                <div className="text-xs"><span className="text-warning">Improve:</span> {s.improve}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
