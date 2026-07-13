import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { Handshake } from "lucide-react";

export const Route = createFileRoute("/university/partnerships")({ component: Partnerships });

function Partnerships() {
  return (
    <>
      <PageHeader
        title="Employer Partnerships"
        description="Companies partnering with your programme."
      />
      <EmptyState
        icon={Handshake}
        title="Partnerships are curated by Proofolio"
        description="Submit an employer introduction request from the University page, and our team will follow up directly. Once approved, active partners will appear here."
      />
    </>
  );
}
