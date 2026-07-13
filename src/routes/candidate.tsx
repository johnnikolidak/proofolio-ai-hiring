import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, type NavItem } from "@/components/DashboardShell";
import { AuthGate } from "@/components/AuthGate";
import { LayoutDashboard, Target, Briefcase, Award, Map, Bot, FileText, User, Settings, MessageSquare, Bell, ClipboardCheck } from "lucide-react";

const nav: NavItem[] = [
  { to: "/candidate", label: "Overview", icon: LayoutDashboard },
  { to: "/candidate/profile", label: "Proof Profile", icon: User },
  { to: "/candidate/challenges", label: "Challenges", icon: Target },
  { to: "/candidate/results", label: "Challenge Results", icon: ClipboardCheck },
  { to: "/candidate/jobs", label: "Jobs", icon: Briefcase },
  { to: "/candidate/applications", label: "Applications", icon: FileText },
  { to: "/candidate/certificates", label: "Certificates", icon: Award },
  { to: "/candidate/roadmap", label: "AI Career Roadmap", icon: Map },
  { to: "/candidate/interview", label: "Interview Preparation", icon: Bot },
  { to: "/candidate/messages", label: "Messages", icon: MessageSquare },
  { to: "/candidate/notifications", label: "Notifications", icon: Bell },
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
