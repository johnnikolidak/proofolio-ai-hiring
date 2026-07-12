import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/candidate/messages")({
  component: Messages,
  head: () => ({ meta: [{ title: "Messages — Proofolio" }] }),
});

const threads = [
  { id: "1", name: "Amelia Chen · Northwind Labs", last: "Loved your submission — quick call this week?", unread: true, ts: "10:24" },
  { id: "2", name: "Priya Shah · Vela", last: "Your Growth case moved to shortlist 🎉", unread: false, ts: "Yesterday" },
  { id: "3", name: "Kinetic recruiting", last: "Scheduling your interview slot.", unread: false, ts: "Mon" },
];

function Messages() {
  const [active, setActive] = useState(threads[0].id);
  const current = threads.find((t) => t.id === active)!;
  return (
    <>
      <PageHeader title="Messages" description="Talk directly with hiring teams." />
      <div className="grid gap-0 rounded-xl border border-border bg-card md:grid-cols-[320px_1fr] min-h-[520px]">
        <div className="border-b border-border md:border-b-0 md:border-r">
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`flex w-full items-start gap-3 border-b border-border p-4 text-left transition-colors hover:bg-secondary/60 ${active === t.id ? "bg-secondary" : ""}`}
            >
              <Avatar className="h-9 w-9"><AvatarFallback>{t.name[0]}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="truncate text-sm font-medium">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground">{t.ts}</div>
                </div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">{t.last}</div>
              </div>
              {t.unread && <Badge className="rounded-full">new</Badge>}
            </button>
          ))}
        </div>
        <div className="flex flex-col">
          <div className="border-b border-border p-4">
            <div className="font-medium">{current.name}</div>
            <div className="text-xs text-muted-foreground">Verified recruiter</div>
          </div>
          <div className="flex-1 space-y-3 p-4">
            <MessageBubble from="them">Hi! Your challenge submission was excellent — top decile.</MessageBubble>
            <MessageBubble from="me">Thanks so much — I really enjoyed the brief.</MessageBubble>
            <MessageBubble from="them">Can we do a 30-min call this Thursday to walk through it?</MessageBubble>
          </div>
          <div className="flex items-center gap-2 border-t border-border p-3">
            <Input placeholder="Write a message…" />
            <Button size="icon"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </>
  );
}

function MessageBubble({ from, children }: { from: "me" | "them"; children: React.ReactNode }) {
  return (
    <div className={`flex ${from === "me" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-sm rounded-2xl px-4 py-2 text-sm ${from === "me" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
        {children}
      </div>
    </div>
  );
}
