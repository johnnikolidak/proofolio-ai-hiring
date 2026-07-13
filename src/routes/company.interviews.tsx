import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { Video } from "lucide-react";

export const Route = createFileRoute("/company/interviews")({ component: Interviews });

function Interviews() {
  return (
    <>
      <PageHeader title="Interviews" description="Structured interview scheduling with panel scoring." />
      <EmptyState
        icon={Video}
        title="Interview scheduling is coming soon"
        description="Coordinate interviews over your existing tools for now. Native scheduling arrives in a later release."
      />
    </>
  );
}
