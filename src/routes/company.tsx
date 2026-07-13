import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, type NavItem } from "@/components/DashboardShell";
import { AuthGate } from "@/components/AuthGate";
import { LayoutDashboard, Users, Wrench, BookOpen, CreditCard, Settings, Briefcase } from "lucide-react";

const nav: NavItem[] = [
  { to: "/company", label: "Overview", icon: LayoutDashboard },
  { to: "/company/jobs", label: "Jobs", icon: Briefcase },
  { to: "/company/candidates", label: "Applicants", icon: Users },
  { to: "/company/challenge-builder", label: "Challenge Builder", icon: Wrench },
  { to: "/company/library", label: "Published Challenges", icon: BookOpen },
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
