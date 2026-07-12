import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, type NavItem } from "@/components/DashboardShell";
import { AuthGate } from "@/components/AuthGate";
import { LayoutDashboard, Megaphone, Users, Wrench, FileBarChart, Video, LineChart, MessageSquare, CreditCard, Settings } from "lucide-react";

const nav: NavItem[] = [
  { to: "/company", label: "Overview", icon: LayoutDashboard },
  { to: "/company/campaigns", label: "Campaigns", icon: Megaphone, badge: 6 },
  { to: "/company/candidates", label: "Candidates", icon: Users, badge: 214 },
  { to: "/company/challenge-builder", label: "Challenge Builder", icon: Wrench },
  { to: "/company/reports", label: "AI Reports", icon: FileBarChart },
  { to: "/company/interviews", label: "Interviews", icon: Video },
  { to: "/company/analytics", label: "Analytics", icon: LineChart },
  { to: "/company/messages", label: "Messages", icon: MessageSquare, badge: 3 },
  { to: "/company/billing", label: "Billing", icon: CreditCard },
  { to: "/company/settings", label: "Settings", icon: Settings },
];

export const Route = createFileRoute("/company")({
  component: () => (
    <AuthGate requiredRole="company">
      <DashboardShell nav={nav} role="Company" />
    </AuthGate>
  ),
  head: () => ({ meta: [{ title: "Company — Proofolio" }] }),
});
