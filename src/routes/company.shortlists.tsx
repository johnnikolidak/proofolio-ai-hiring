import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { ListChecks } from "lucide-react";

export const Route = createFileRoute("/company/shortlists")({ component: Shortlists });

function Shortlists() {
  return (
    <>
      <PageHeader title="Shortlists" description="Curated candidate pools per role." />
      <EmptyState
        icon={ListChecks}
        title="Shortlists are coming soon"
        description="Review applicants and challenge submissions individually for now."
        action={<Button asChild variant="outline"><Link to="/company/candidates">View applicants</Link></Button>}
      />
    </>
  );
}
