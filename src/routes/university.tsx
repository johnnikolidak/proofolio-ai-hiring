import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, type NavItem } from "@/components/DashboardShell";
import { AuthGate } from "@/components/AuthGate";
import { LayoutDashboard, Target, Users, Trophy, Sparkles, Award, Handshake, LineChart, MessageSquare, Settings } from "lucide-react";

const nav: NavItem[] = [
  { to: "/university", label: "Overview", icon: LayoutDashboard },
  { to: "/university/challenges", label: "Campus Challenges", icon: Target },
  { to: "/university/students", label: "Students", icon: Users },
  { to: "/university/leaderboards", label: "Leaderboards", icon: Trophy },
  { to: "/university/evidence", label: "Evidence Dimensions", icon: Sparkles },
  { to: "/university/certificates", label: "Certificates", icon: Award },
  { to: "/university/partnerships", label: "Employer Partnerships", icon: Handshake },
  { to: "/university/analytics", label: "Analytics", icon: LineChart },
  { to: "/university/messages", label: "Messages", icon: MessageSquare },
  { to: "/university/settings", label: "Settings", icon: Settings },
];

export const Route = createFileRoute("/university")({
  component: () => (
    <AuthGate requiredRole="university">
      <DashboardShell nav={nav} role="University" />
    </AuthGate>
  ),
  head: () => ({ meta: [{ title: "University — Proofolio" }] }),
});
