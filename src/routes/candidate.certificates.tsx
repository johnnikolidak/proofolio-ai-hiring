import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { Award } from "lucide-react";

export const Route = createFileRoute("/candidate/certificates")({ component: Certificates });

function Certificates() {
  return (
    <>
      <PageHeader title="Certificates" description="Verified certificates issued for challenges you complete." />
      <EmptyState
        icon={Award}
        title="No certificates yet"
        description="Complete a sponsored challenge to earn a verified certificate you can share with employers."
      />
    </>
  );
}
