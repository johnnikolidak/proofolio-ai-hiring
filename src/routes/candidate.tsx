import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, type NavItem } from "@/components/DashboardShell";
import { AuthGate } from "@/components/AuthGate";
import { LayoutDashboard, Target, Briefcase, Award, Map, Bot, FileText, User, Settings } from "lucide-react";

const nav: NavItem[] = [
  { to: "/candidate", label: "Overview", icon: LayoutDashboard },
  { to: "/candidate/challenges", label: "Challenges", icon: Target, badge: 4 },
  { to: "/candidate/jobs", label: "Jobs", icon: Briefcase },
  { to: "/candidate/certificates", label: "Certificates", icon: Award },
  { to: "/candidate/roadmap", label: "AI Career Roadmap", icon: Map },
  { to: "/candidate/interview", label: "AI Interview", icon: Bot },
  { to: "/candidate/applications", label: "Applications", icon: FileText },
  { to: "/candidate/profile", label: "Profile", icon: User },
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
