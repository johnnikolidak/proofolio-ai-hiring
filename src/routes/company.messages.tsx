import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/company/messages")({ component: Messages });

function Messages() {
  return (
    <>
      <PageHeader title="Messages" description="Talk with candidates in-context." />
      <EmptyState
        icon={MessageSquare}
        title="In-app messaging is coming soon"
        description="Reach out to candidates via the email on their Proof Profile for now."
      />
    </>
  );
}
