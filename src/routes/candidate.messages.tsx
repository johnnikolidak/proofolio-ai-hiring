import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { EmptyState } from "@/components/EmptyState";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/candidate/messages")({
  component: Messages,
  head: () => ({ meta: [{ title: "Messages — Proofolio" }] }),
});

function Messages() {
  return (
    <>
      <PageHeader title="Messages" description="Direct conversations with hiring teams." />
      <EmptyState
        icon={MessageSquare}
        title="No conversations yet"
        description="Once a company opens a thread with you about an application or challenge submission, it will appear here."
      />
    </>
  );
}
