import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/university/evidence")({ component: Evidence });

function Evidence() {
  return (
    <>
      <PageHeader title="Evidence Dimensions" description="How your cohort performs across the signals we track." />
      <EmptyState
        icon={Sparkles}
        title="No evidence data yet"
        description="Once your students submit challenges, dimension scores will appear here."
      />
    </>
  );
}
