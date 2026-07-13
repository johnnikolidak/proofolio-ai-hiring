import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { LineChart } from "lucide-react";

export const Route = createFileRoute("/university/analytics")({ component: Analytics });

function Analytics() {
  return (
    <>
      <PageHeader title="Analytics" description="Participation, completion, and cohort trends." />
      <EmptyState
        icon={LineChart}
        title="Analytics unlock with data"
        description="As your students participate in campus challenges, participation and completion charts will populate here."
      />
    </>
  );
}
