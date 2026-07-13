import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/DashboardShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export const Route = createFileRoute("/company/messages")({ component: Messages });

const threads = [
  { name: "Sofía Alvarez", last: "Thanks — I can do 2pm on Thursday.", unread: 2, active: true },
  { name: "Kenji Watanabe", last: "Just submitted the case!", unread: 1 },
  { name: "Amara Okafor", last: "Sounds great, see you then.", unread: 0 },
  { name: "Liam O'Sullivan", last: "Following up on my application.", unread: 0 },
  { name: "Priya Patel", last: "Really excited about the role.", unread: 0 },
];

const msgs = [
  { from: "them", text: "Hi Amelia! Thanks for shortlisting me for the Growth Analyst role." },
  { from: "me", text: "Hi Sofía — congrats! Would love to set up a 45-min call this week." },
  { from: "them", text: "Absolutely. I'm free Thu/Fri afternoons." },
  { from: "me", text: "Perfect, sending an invite for Thu 2pm." },
  { from: "them", text: "Thanks — I can do 2pm on Thursday." },
];

function Messages() {
  const [text, setText] = useState("");
  return (
    <>
      <PageHeader title="Messages" description="Talk with candidates in-context." />
      <div className="grid h-[calc(100vh-14rem)] overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[300px_1fr]">
        <div className="overflow-y-auto border-r border-border">
          {threads.map((t) => (
            <button key={t.name} className={`flex w-full items-center gap-3 border-b border-border p-4 text-left ${t.active ? "bg-primary-soft" : "hover:bg-secondary/50"}`}>
              <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary-soft text-primary text-xs font-semibold">{t.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="truncate text-sm font-medium">{t.name}</div>
                  {t.unread > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{t.unread}</span>}
                </div>
                <div className="truncate text-xs text-muted-foreground">{t.last}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="flex flex-col">
          <div className="border-b border-border p-4">
            <div className="font-semibold">Sofía Alvarez</div>
            <div className="text-xs text-muted-foreground">Growth Analyst — Q3</div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-6">
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${m.from === "me" ? "ml-auto bg-primary text-primary-foreground" : "bg-secondary"}`}>
                {m.text}
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); setText(""); }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." className="border-0 focus-visible:ring-0" />
            <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      </div>
    </>
  );
}
