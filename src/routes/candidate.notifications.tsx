import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { Award, Bell, Briefcase, MessageSquare, Target } from "lucide-react";

export const Route = createFileRoute("/candidate/notifications")({
  component: Notifications,
  head: () => ({ meta: [{ title: "Notifications — Proofolio" }] }),
});

const items = [
  { Icon: Target, title: "New challenge match", body: "Vela posted a Growth Analyst challenge that matches 94% of your skills.", ts: "just now" },
  { Icon: Award, title: "Certificate issued", body: "You earned a verified SQL Analytics certificate.", ts: "2 h ago" },
  { Icon: MessageSquare, title: "Amelia (Northwind) replied", body: "\"Loved your submission — quick call this week?\"", ts: "10 h ago" },
  { Icon: Briefcase, title: "Application update", body: "Your application to Lumen is under review.", ts: "yesterday" },
];

function Notifications() {
  return (
    <>
      <PageHeader title="Notifications" description="Everything that needs your attention." />
      <div className="rounded-xl border border-border bg-card">
        {items.map((n, i) => (
          <div key={i} className="flex items-start gap-4 border-b border-border p-5 last:border-0">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
              <n.Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{n.title}</div>
              <div className="mt-0.5 text-sm text-muted-foreground">{n.body}</div>
            </div>
            <div className="text-xs text-muted-foreground">{n.ts}</div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="p-10 text-center text-muted-foreground">
            <Bell className="mx-auto h-6 w-6" />
            <p className="mt-2 text-sm">You're all caught up.</p>
          </div>
        )}
      </div>
    </>
  );
}
