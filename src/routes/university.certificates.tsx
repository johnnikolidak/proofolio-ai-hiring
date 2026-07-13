import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { Award } from "lucide-react";

export const Route = createFileRoute("/university/certificates")({ component: Certificates });

function Certificates() {
  return (
    <>
      <PageHeader title="Certificates" description="Verified certificates issued from your challenges." />
      <EmptyState
        icon={Award}
        title="No certificates issued yet"
        description="Certificates will appear here as students complete your campus challenges."
      />
    </>
  );
}
