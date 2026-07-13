import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { Map } from "lucide-react";

export const Route = createFileRoute("/candidate/roadmap")({ component: Roadmap });

function Roadmap() {
  return (
    <>
      <PageHeader title="AI Career Roadmap" description="Your personalized plan, based on your challenge submissions." />
      <EmptyState
        icon={Map}
        title="Your roadmap will appear here"
        description="Complete your Proof Profile and submit a challenge — we'll build a personalized plan from your evidence."
      />
    </>
  );
}
