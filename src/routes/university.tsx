import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, type NavItem } from "@/components/DashboardShell";
import { AuthGate } from "@/components/AuthGate";
import { LayoutDashboard, Target, Handshake, Settings } from "lucide-react";

const nav: NavItem[] = [
  { to: "/university", label: "Overview", icon: LayoutDashboard },
  { to: "/university/challenges", label: "Campus Challenges", icon: Target },
  { to: "/university/partnerships", label: "Employer Partnerships", icon: Handshake },
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
