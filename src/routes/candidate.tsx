import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, type NavItem } from "@/components/DashboardShell";
import { AuthGate } from "@/components/AuthGate";
import { LayoutDashboard, Target, Briefcase, FileText, User, Settings } from "lucide-react";

const nav: NavItem[] = [
  { to: "/candidate", label: "Overview", icon: LayoutDashboard },
  { to: "/candidate/profile", label: "Proof Profile", icon: User },
  { to: "/candidate/challenges", label: "Challenges", icon: Target },
  { to: "/candidate/jobs", label: "Jobs", icon: Briefcase },
  { to: "/candidate/applications", label: "Applications", icon: FileText },
  { to: "/candidate/settings", label: "Settings", icon: Settings },
];

export const Route = createFileRoute("/candidate")({
  component: () => (
    <AuthGate requiredRole="candidate">
      <DashboardShell nav={nav} role="Candidate" />
    </AuthGate>
  ),
  head: () => ({ meta: [{ title: "Candidate — Proofolio" }] }),
});
