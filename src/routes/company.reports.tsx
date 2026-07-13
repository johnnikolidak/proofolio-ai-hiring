import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { FileBarChart } from "lucide-react";

export const Route = createFileRoute("/company/reports")({ component: Reports });

function Reports() {
  return (
    <>
      <PageHeader title="AI Reports" description="Evidence-linked scoring for every submission." />
      <EmptyState
        icon={FileBarChart}
        title="AI scoring is coming soon"
        description="Once AI grading is enabled for your workspace, per-submission reports will appear here."
      />
    </>
  );
}
