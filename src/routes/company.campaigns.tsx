import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Megaphone } from "lucide-react";

export const Route = createFileRoute("/company/campaigns")({ component: Campaigns });

function Campaigns() {
  return (
    <>
      <PageHeader title="Campaigns" description="Multi-challenge hiring campaigns." />
      <EmptyState
        icon={Megaphone}
        title="Campaigns are coming soon"
        description="For now, post jobs and create challenges individually. Bundled campaigns arrive in a later release."
        action={<Button asChild variant="outline"><Link to="/company/jobs">Post a job</Link></Button>}
      />
    </>
  );
}
